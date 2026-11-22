#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { partitionSchema, dereferenceSchema } from "../lib/models/schemaPartition.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CATALOG_OUTPUT_PATH = path.join(ROOT_DIR, "lib", "models", "kie-catalog.json");

const BASE_URL = process.env.KIE_API_BASE || "https://api.kie.ai";
const API_KEY = (process.env.KIE_API_KEY || "").trim();

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} from ${url}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.code !== undefined && json.code !== 200) {
    throw new Error(`API error ${json.code}: ${json.msg}`);
  }
  return json.data;
}

/** Fetches models through authenticated /api/v1/models or public pagePlaygroundGroup fallback */
async function discoverModels() {
  if (API_KEY) {
    console.log("[sync-catalog] Fetching models via authenticated /api/v1/models...");
    try {
      const data = await fetchJson(`${BASE_URL}/api/v1/models`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (Array.isArray(data?.models) && data.models.length > 0) {
        return data.models;
      }
    } catch (err) {
      console.warn("[sync-catalog] Warning: /api/v1/models failed, falling back to playground:", err.message);
    }
  }

  console.log("[sync-catalog] Fetching public model catalog via pagePlaygroundGroup...");
  const records = [];
  let pageNum = 1;
  while (pageNum <= 5) {
    try {
      const res = await fetchJson(`${BASE_URL}/api/v1/playground/pagePlaygroundGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageNum, pageSize: 100, groupName: "", tasks: [], provider: [] }),
      });
      const list = res?.records || [];
      records.push(...list);
      if (pageNum >= (res?.pages || 1) || list.length === 0) break;
      pageNum++;
    } catch (err) {
      console.warn(`[sync-catalog] Failed on page ${pageNum}:`, err.message);
      break;
    }
  }
  return records;
}

/** Infer modality from taskType array or title */
function inferModality(taskType = [], name = "") {
  const types = taskType.map((t) => String(t).toLowerCase());
  const lowerName = name.toLowerCase();

  if (types.some((t) => t.includes("video")) || lowerName.includes("video")) return "video";
  if (types.some((t) => t.includes("image") || t.includes("upscale")) || lowerName.includes("image")) return "image";
  if (types.some((t) => t.includes("audio") || t.includes("speech") || t.includes("dialogue"))) return "audio";
  if (types.some((t) => t.includes("chat"))) return "chat";
  return "image";
}

/** Fetch schema for a model or generate an OpenAPI schema fallback based on known parameters */
async function fetchModelSchema(modelSlug, modality) {
  if (API_KEY) {
    try {
      const data = await fetchJson(`${BASE_URL}/api/v1/models/${modelSlug}/schema`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      if (data?.openapi) {
        // Find input schema in OpenAPI paths
        const paths = data.paths || {};
        for (const pathObj of Object.values(paths)) {
          const postOp = pathObj?.post;
          const bodySchema = postOp?.requestBody?.content?.["application/json"]?.schema;
          const inputSchema = bodySchema?.properties?.input;
          if (inputSchema) {
            return {
              ...inputSchema,
              components: data.components,
              definitions: data.definitions,
            };
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  // Schema fallback based on modality
  if (modality === "video") {
    return {
      type: "object",
      required: ["prompt"],
      properties: {
        prompt: { type: "string", description: "Video generation prompt", maxLength: 10000 },
        aspect_ratio: {
          type: "string",
          description: "Aspect ratio",
          enum: ["16:9", "9:16", "1:1", "Auto"],
          default: "16:9",
        },
        duration: { type: "integer", description: "Duration in seconds", minimum: 3, maximum: 30, default: 5 },
        resolution: { type: "string", description: "Resolution", enum: ["720p", "1080p", "4k"], default: "720p" },
        sound: { type: "boolean", description: "Enable native sound generation", default: false },
        mode: { type: "string", description: "Generation mode", enum: ["std", "pro"], default: "pro" },
        start_frame: { type: "string", description: "Start frame image URL", format: "uri" },
        end_frame: { type: "string", description: "End frame image URL", format: "uri" },
        video_ref: { type: "string", description: "Reference video URL", format: "uri" },
        seed: { type: "integer", description: "Random seed" },
      },
    };
  }

  return {
    type: "object",
    required: ["prompt"],
    properties: {
      prompt: { type: "string", description: "Image generation prompt", maxLength: 20000 },
      aspect_ratio: {
        type: "string",
        description: "Aspect ratio",
        enum: ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"],
        default: "1:1",
      },
      quality: { type: "string", description: "Quality setting", enum: ["1k", "2k", "4k"], default: "2k" },
      image_input: {
        type: "array",
        description: "Reference image URLs",
        items: { type: "string", format: "uri" },
        maxItems: 8,
      },
      negative_prompt: { type: "string", description: "Negative prompt to exclude unwanted elements", maxLength: 2000 },
      seed: { type: "integer", description: "Random seed" },
    },
  };
}

async function main() {
  console.log("[sync-catalog] Starting Kie model catalog synchronization...");
  const rawModels = await discoverModels();
  console.log(`[sync-catalog] Discovered ${rawModels.length} raw model records.`);

  const catalogModels = [];

  for (const m of rawModels) {
    const modelSlug = String(m.model || m.path || m.slug || "").replace(/^\/+/, "");
    if (!modelSlug) continue;

    const name = m.groupName || m.title || m.name || modelSlug;
    const provider = m.provider || "Kie";
    const taskType = Array.isArray(m.taskType) ? m.taskType : [];
    const modality = inferModality(taskType, name);
    const description = m.tagline || m.description || "";
    const coverLink = m.coverLink || undefined;

    // Filter to generative image, video, audio models
    if (modality === "chat") continue;

    const rawSchema = await fetchModelSchema(modelSlug, modality);
    const partition = partitionSchema(rawSchema);

    catalogModels.push({
      id: modelSlug.replace(/[^a-zA-Z0-9_-]/g, "-"),
      model: modelSlug,
      name,
      provider,
      modality,
      taskType,
      description,
      coverLink,
      schema: rawSchema,
      handles: partition.handles,
      parameters: partition.parameters,
      aspectRatioKey: partition.aspectRatioKey,
      defaultAspectRatio: partition.defaultAspectRatio,
      ratios: partition.ratios,
    });
  }

  // Ensure output directory exists
  await fs.mkdir(path.dirname(CATALOG_OUTPUT_PATH), { recursive: true });

  const catalog = {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    models: catalogModels,
  };

  await fs.writeFile(CATALOG_OUTPUT_PATH, JSON.stringify(catalog, null, 2), "utf8");
  console.log(`[sync-catalog] Successfully compiled ${catalogModels.length} models into ${CATALOG_OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("[sync-catalog] Fatal error:", err);
  process.exit(1);
});
