import type { CatalogModel } from "./types.ts";

export interface BuildTaskInputOptions {
  prompt?: string;
  params?: Record<string, unknown>;
  mediaInputs?: Record<string, string | string[] | undefined | null>;
}

/**
 * Universally transforms user parameters and connected media inputs into the
 * upstream createTask.input payload expected by Kie.ai OpenAPI schemas.
 */
export function buildUniversalTaskInput(
  model: CatalogModel,
  options: BuildTaskInputOptions
): Record<string, unknown> {
  const { prompt, params = {}, mediaInputs = {} } = options;
  const payload: Record<string, unknown> = {};
  const schemaProps = model.schema.properties ?? {};

  // 1. Map Prompt
  const promptProp = schemaProps.prompt;
  const rawPrompt = prompt ?? (params.prompt as string | undefined);
  if (rawPrompt !== undefined) {
    const trimmed = rawPrompt.trim();
    if (promptProp?.maxLength && promptProp.maxLength > 0) {
      payload.prompt = trimmed.slice(0, promptProp.maxLength);
    } else {
      payload.prompt = trimmed;
    }
  }

  // 2. Map Media Port Handles
  for (const handle of model.handles) {
    const val = mediaInputs[handle.key] ?? params[handle.key];
    if (val === undefined || val === null) continue;

    if (handle.isArray) {
      const arr = Array.isArray(val) ? val : [val];
      const validUrls = arr.filter((u): u is string => typeof u === "string" && !!u.trim());
      if (validUrls.length > 0) {
        payload[handle.key] = handle.maxCount ? validUrls.slice(0, handle.maxCount) : validUrls;
      }
    } else {
      const single = Array.isArray(val) ? val[0] : val;
      if (typeof single === "string" && single.trim()) {
        payload[handle.key] = single.trim();
      }
    }
  }

  // 3. Map Schema-Driven Parameters
  for (const param of model.parameters) {
    if (param.key === "prompt") continue; // already mapped

    // nsfw_checker must always be false when sent to Kie API
    if (param.key === "nsfw_checker") {
      payload.nsfw_checker = false;
      continue;
    }

    let val = params[param.key];
    if (val === undefined || val === null || val === "") {
      val = param.default;
    }

    if (val === undefined || val === null) continue;

    switch (param.type) {
      case "integer": {
        const n = parseInt(String(val), 10);
        if (!isNaN(n)) {
          let clamped = n;
          if (param.min !== undefined) clamped = Math.max(param.min, clamped);
          if (param.max !== undefined) clamped = Math.min(param.max, clamped);
          payload[param.key] = clamped;
        }
        break;
      }
      case "number": {
        const n = parseFloat(String(val));
        if (!isNaN(n)) {
          let clamped = n;
          if (param.min !== undefined) clamped = Math.max(param.min, clamped);
          if (param.max !== undefined) clamped = Math.min(param.max, clamped);
          payload[param.key] = clamped;
        }
        break;
      }
      case "boolean": {
        payload[param.key] = typeof val === "boolean" ? val : val === "true" || val === 1;
        break;
      }
      case "string": {
        const s = String(val);
        payload[param.key] = param.maxLength && param.maxLength > 0 ? s.slice(0, param.maxLength) : s;
        break;
      }
      case "array": {
        if (Array.isArray(val)) {
          payload[param.key] = val;
        }
        break;
      }
      default: {
        payload[param.key] = val;
      }
    }
  }

  return payload;
}
