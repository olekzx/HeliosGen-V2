import test from "node:test";
import assert from "node:assert";
import { buildUniversalTaskInput } from "../lib/models/taskSerialization.ts";
import type { CatalogModel } from "../lib/models/types.ts";

const sampleModel: CatalogModel = {
  id: "test-model",
  model: "test-model-api",
  name: "Test Model",
  provider: "TestProvider",
  modality: "video",
  taskType: ["Text to Video", "Image to Video"],
  aspectRatioKey: "aspect_ratio",
  schema: {
    type: "object",
    required: ["prompt", "aspect_ratio"],
    properties: {
      prompt: { type: "string", maxLength: 100 },
      aspect_ratio: { type: "string", enum: ["16:9", "9:16", "1:1"], default: "16:9" },
      duration: { type: "integer", minimum: 5, maximum: 10, default: 5 },
      sound: { type: "boolean", default: false },
      cfg_scale: { type: "number", minimum: 1, maximum: 20 },
      first_frame: { type: "string", format: "uri" },
      reference_images: { type: "array", items: { type: "string" }, maxItems: 3 },
    },
  },
  handles: [
    { key: "first_frame", type: "image", title: "First Frame", required: false, isArray: false },
    { key: "reference_images", type: "image", title: "Reference Images", required: false, isArray: true, maxCount: 3 },
  ],
  parameters: [
    { key: "prompt", type: "string", control: "textarea", title: "Prompt", required: true, maxLength: 100 },
    { key: "aspect_ratio", type: "string", control: "dropdown", title: "Aspect Ratio", required: true, default: "16:9" },
    { key: "duration", type: "integer", control: "slider", title: "Duration", required: false, default: 5, min: 5, max: 10 },
    { key: "sound", type: "boolean", control: "toggle", title: "Sound", required: false, default: false },
    { key: "cfg_scale", type: "number", control: "slider", title: "CFG Scale", required: false, min: 1, max: 20 },
  ],
};

test("buildUniversalTaskInput serializes scalar parameters and handles into clean API payload", () => {
  const params = {
    aspect_ratio: "16:9",
    duration: "8", // string that should be coerced to integer
    sound: true,
    cfg_scale: 7.5,
    unknown_discard: "should_be_omitted_if_not_in_schema",
  };

  const mediaInputs = {
    first_frame: "https://example.com/frame.png",
    reference_images: [
      "https://example.com/ref1.png",
      "https://example.com/ref2.png",
      "https://example.com/ref3.png",
      "https://example.com/ref4_overflow.png", // exceeds maxCount 3
    ],
  };

  const prompt = "A futuristic neon city at night";

  const payload = buildUniversalTaskInput(sampleModel, {
    prompt,
    params,
    mediaInputs,
  });

  // Prompt is correctly mapped and truncated if needed
  assert.strictEqual(payload.prompt, "A futuristic neon city at night");

  // Scalar parameters mapped and coerced
  assert.strictEqual(payload.aspect_ratio, "16:9");
  assert.strictEqual(payload.duration, 8);
  assert.strictEqual(payload.sound, true);
  assert.strictEqual(payload.cfg_scale, 7.5);

  // Unknown property not in schema is filtered
  assert.strictEqual(payload.unknown_discard, undefined);

  // Single media handle mapped
  assert.strictEqual(payload.first_frame, "https://example.com/frame.png");

  // Array media handle clamped to maxCount
  assert.deepStrictEqual(payload.reference_images, [
    "https://example.com/ref1.png",
    "https://example.com/ref2.png",
    "https://example.com/ref3.png",
  ]);
});

test("buildUniversalTaskInput applies schema defaults for missing optional parameters", () => {
  const payload = buildUniversalTaskInput(sampleModel, {
    prompt: "Test prompt",
    params: {},
    mediaInputs: {},
  });

  assert.strictEqual(payload.aspect_ratio, "16:9");
  assert.strictEqual(payload.duration, 5);
  assert.strictEqual(payload.sound, false);
});
