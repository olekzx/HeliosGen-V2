import type { CatalogModel, KieCatalog } from "./types.ts";
import rawCatalog from "./kie-catalog.json" with { type: "json" };

const catalog = rawCatalog as KieCatalog;

/** Returns the entire compiled Kie model catalog */
export function getCatalog(): KieCatalog {
  return catalog;
}

/** Returns all generative image models in the catalog */
export function getImageModels(): CatalogModel[] {
  return catalog.models.filter((m) => m.modality === "image");
}

/** Returns all generative video models in the catalog */
export function getVideoModels(): CatalogModel[] {
  return catalog.models.filter((m) => m.modality === "video");
}

/** Finds a catalog model by internal ID or API model identifier */
export function getModelById(idOrModel: string): CatalogModel | undefined {
  if (!idOrModel) return undefined;
  const target = idOrModel.toLowerCase().trim();
  return catalog.models.find(
    (m) =>
      m.id.toLowerCase() === target ||
      m.model.toLowerCase() === target ||
      m.id.toLowerCase() === target.replace(/[^a-z0-9_-]/g, "-") ||
      m.name.toLowerCase() === target
  );
}

/** Finds a catalog model by exact upstream API model string */
export function getModelByApiId(apiId: string): CatalogModel | undefined {
  if (!apiId) return undefined;
  return catalog.models.find((m) => m.model === apiId);
}

import type { ImageModel, VideoModel, VideoHandle } from "../modelConfig.ts";

/** Converts a CatalogModel definition into an ImageModel compatible with HeliosGen studio */
export function catalogModelToImageModel(m: CatalogModel): ImageModel {
  const imageHandle = m.handles.find((h) => h.type === "image");
  const qualityParam = m.parameters.find((p) => p.key === "quality" || p.key === "resolution");
  const ratios = m.ratios && m.ratios.length > 0 ? m.ratios : ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2", "21:9"];

  return {
    id: m.id,
    apiId: m.model,
    name: m.name,
    provider: m.provider,
    ratios,
    supportsImages: !!imageHandle,
    maxImages: imageHandle?.maxCount ?? 8,
    supportsQuality: !!qualityParam,
    apiInput: {
      aspectRatioKey: m.aspectRatioKey ?? "aspect_ratio",
      imageInputKey: imageHandle?.key ?? "image_input",
      qualityKey: qualityParam?.key ?? "quality",
      qualityOptions: qualityParam?.enum?.map((e) => String(e.value)) ?? ["1k", "2k", "4k"],
      promptMaxLength: m.parameters.find((p) => p.key === "prompt")?.maxLength ?? 20000,
    },
  };
}

/** Converts a CatalogModel definition into a VideoModel compatible with HeliosGen studio */
export function catalogModelToVideoModel(m: CatalogModel): VideoModel {
  const handles: VideoHandle[] = ["prompt"];

  for (const h of m.handles) {
    if (h.key.includes("start") || h.key.includes("first")) handles.push("startFrame");
    else if (h.key.includes("end") || h.key.includes("last")) handles.push("endFrame");
    else if (h.type === "video") handles.push("videoRef");
    else if (h.type === "audio") handles.push("audioRef");
    else if (h.type === "image") handles.push("resource");
  }

  // Deduplicate handles
  const uniqueHandles = [...new Set(handles)] as VideoHandle[];

  const durationParam = m.parameters.find((p) => p.key === "duration");
  const resParam = m.parameters.find((p) => p.key === "resolution");
  const modeParam = m.parameters.find((p) => p.key === "mode");
  const soundParam = m.parameters.find((p) => p.key === "sound");
  const seedParam = m.parameters.find((p) => p.key === "seed");

  const ratios = m.ratios && m.ratios.length > 0 ? m.ratios : ["16:9", "9:16", "1:1"];

  return {
    id: m.id,
    apiId: m.model,
    name: m.name,
    provider: m.provider,
    ratios,
    durations: durationParam?.min && durationParam?.max ? [durationParam.min, durationParam.max] : [5, 10],
    defaultDuration: typeof durationParam?.default === "number" ? durationParam.default : 5,
    defaultRatio: m.defaultAspectRatio ?? ratios[0] ?? "16:9",
    handles: uniqueHandles,
    sound: !!soundParam,
    supportsSeeds: !!seedParam,
    modes: modeParam?.enum?.map((e) => ({ value: String(e.value), label: e.label })),
    defaultMode: modeParam?.default ? String(modeParam.default) : undefined,
    resolutions: resParam?.enum?.map((e) => String(e.value)) ?? ["720p", "1080p"],
    defaultResolution: resParam?.default ? String(resParam.default) : "720p",
    apiInput: {
      aspectRatioKey: m.aspectRatioKey ?? "aspect_ratio",
      durationKey: durationParam?.key ?? "duration",
      durationMin: durationParam?.min ?? 3,
      durationMax: durationParam?.max ?? 30,
      modeKey: modeParam?.key,
      soundKey: soundParam?.key,
      resolutionKey: resParam?.key,
      promptMaxLength: m.parameters.find((p) => p.key === "prompt")?.maxLength ?? 10000,
    },
  };
}
