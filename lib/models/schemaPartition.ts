import type {
  OpenAPISchema,
  OpenAPISchemaProperty,
  MediaPortHandle,
  MediaHandleType,
  CatalogParameter,
  ParameterControl,
  ParameterEnumOption,
} from "./types.js";

/** Resolves $ref pointers within an OpenAPI schema (e.g., #/components/schemas/Name or #/definitions/Name) */
export function dereferenceSchema(schema: OpenAPISchema): OpenAPISchema {
  const definitions: Record<string, OpenAPISchemaProperty | undefined> = {
    ...(schema.components?.schemas ?? {}),
    ...(schema.definitions ?? {}),
  };

  function resolveRef(ref: string): OpenAPISchemaProperty | undefined {
    const parts = ref.replace(/^#\//, "").split("/");
    const key = parts[parts.length - 1];
    return definitions[key];
  }

  function resolveNode<T>(node: T, seen = new Set<string>()): T {
    if (!node || typeof node !== "object") return node;

    if (Array.isArray(node)) {
      return node.map((item) => resolveNode(item, seen)) as unknown as T;
    }

    const obj = node as Record<string, unknown>;
    if (typeof obj.$ref === "string") {
      const ref = obj.$ref;
      if (seen.has(ref)) return node; // prevent cycles
      const target = resolveRef(ref);
      if (target) {
        const nextSeen = new Set(seen);
        nextSeen.add(ref);
        const resolved = resolveNode(target, nextSeen);
        const { $ref: _, ...rest } = obj;
        return { ...(resolved as Record<string, unknown>), ...rest } as T;
      }
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = resolveNode(v, seen);
    }
    return out as T;
  }

  return resolveNode(schema);
}

/** Determines if a schema property represents a connectable media port handle on the canvas */
function detectMediaHandle(
  key: string,
  prop: OpenAPISchemaProperty,
  required: boolean
): MediaPortHandle | null {
  const lowerKey = key.toLowerCase();
  const desc = (prop.description ?? "").toLowerCase();

  const isVideo =
    lowerKey.includes("video") ||
    lowerKey === "input_video" ||
    desc.includes("reference video") ||
    desc.includes("motion video");

  const isAudio =
    lowerKey.includes("audio") ||
    lowerKey.includes("sound_url") ||
    lowerKey.includes("music_url") ||
    desc.includes("reference audio") ||
    desc.includes("voice url");

  const isImage =
    !isVideo &&
    !isAudio &&
    (lowerKey.includes("image") ||
      lowerKey.includes("input_urls") ||
      lowerKey === "images" ||
      lowerKey === "first_frame" ||
      lowerKey === "last_frame" ||
      lowerKey === "start_frame" ||
      lowerKey === "end_frame" ||
      desc.includes("reference image") ||
      desc.includes("input image") ||
      desc.includes("image url") ||
      desc.includes("uploaded file"));

  if (!isImage && !isVideo && !isAudio) return null;

  const type: MediaHandleType = isVideo ? "video" : isAudio ? "audio" : "image";
  const isArray = prop.type === "array" || Array.isArray(prop.items) || !!prop.items;

  // Extract maximum count if specified
  let maxCount = prop.maximum ?? prop.maxItems;
  if (!maxCount && prop.description) {
    const match = prop.description.match(/(?:up to|maximum|max)\s*(\d+)/i);
    if (match) maxCount = parseInt(match[1], 10);
  }

  return {
    key,
    type,
    title: prop.title ?? formatTitle(key),
    description: prop.description,
    required,
    isArray,
    maxCount,
  };
}

function formatTitle(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Formats enum options into label/value pairs */
function formatEnumOptions(options: unknown[]): ParameterEnumOption[] {
  return options.map((opt) => {
    const val = typeof opt === "string" || typeof opt === "number" ? opt : String(opt);
    return {
      label: String(opt),
      value: val,
    };
  });
}

export interface PartitionResult {
  handles: MediaPortHandle[];
  parameters: CatalogParameter[];
  aspectRatioKey?: string;
  defaultAspectRatio?: string;
  ratios?: string[];
}

/**
 * Separates an OpenAPI model schema into:
 *  1. Media Port Handles (image/video/audio inputs connectable via canvas wires)
 *  2. Schema-Driven Parameters (scalars passed to Dynamic Parameter Inspector)
 */
export function partitionSchema(rawSchema: OpenAPISchema): PartitionResult {
  const schema = dereferenceSchema(rawSchema);
  const properties = schema.properties ?? {};
  const requiredKeys = new Set(schema.required ?? []);

  const handles: MediaPortHandle[] = [];
  const parameters: CatalogParameter[] = [];

  let aspectRatioKey: string | undefined;
  let defaultAspectRatio: string | undefined;
  let ratios: string[] | undefined;

  for (const [key, prop] of Object.entries(properties)) {
    if (!prop) continue;
    const isRequired = requiredKeys.has(key);

    // 1. Check if property is a media handle
    const handle = detectMediaHandle(key, prop, isRequired);
    if (handle) {
      handles.push(handle);
      continue;
    }

    // Detect Aspect Ratio key and options
    const lowerKey = key.toLowerCase();
    if (
      (lowerKey === "aspect_ratio" || lowerKey === "image_size" || lowerKey === "aspectratio" || lowerKey === "ratio") &&
      prop.enum &&
      prop.enum.length > 0
    ) {
      aspectRatioKey = key;
      ratios = prop.enum.map(String);
      defaultAspectRatio = typeof prop.default === "string" ? prop.default : ratios[0];
    }

    // Determine parameter control
    let control: ParameterControl = "text";
    let enumOptions: ParameterEnumOption[] | undefined;

    if (prop.enum && prop.enum.length > 0) {
      control = "dropdown";
      enumOptions = formatEnumOptions(prop.enum);
    } else if (prop.type === "boolean") {
      control = "toggle";
    } else if (prop.type === "integer" || prop.type === "number") {
      if (prop.minimum !== undefined && prop.maximum !== undefined) {
        control = "slider";
      } else {
        control = "number";
      }
    } else if (prop.type === "string") {
      if (
        (prop.maxLength && prop.maxLength > 100) ||
        lowerKey.includes("prompt") ||
        lowerKey.includes("description") ||
        lowerKey.includes("text")
      ) {
        control = "textarea";
      } else {
        control = "text";
      }
    }

    parameters.push({
      key,
      type: (prop.type as "string" | "number" | "integer" | "boolean" | "array") ?? "string",
      control,
      title: prop.title ?? formatTitle(key),
      description: prop.description,
      required: isRequired,
      default: prop.default,
      enum: enumOptions,
      min: prop.minimum,
      max: prop.maximum,
      step: prop.type === "integer" ? 1 : 0.1,
      maxLength: prop.maxLength,
    });
  }

  return {
    handles,
    parameters,
    aspectRatioKey,
    defaultAspectRatio,
    ratios,
  };
}
