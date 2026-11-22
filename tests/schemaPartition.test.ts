import test from "node:test";
import assert from "node:assert";
import { partitionSchema, dereferenceSchema } from "../lib/models/schemaPartition.ts";
import type { OpenAPISchema } from "../lib/models/types.ts";

test("dereferenceSchema resolves $ref pointers correctly", () => {
  const schema: OpenAPISchema = {
    type: "object",
    properties: {
      ratio: { $ref: "#/components/schemas/RatioEnum" },
    },
    components: {
      schemas: {
        RatioEnum: {
          type: "string",
          enum: ["16:9", "9:16", "1:1"],
          default: "16:9",
        },
      },
    },
  };

  const derefed = dereferenceSchema(schema);
  assert.strictEqual(derefed.properties?.ratio?.type, "string");
  assert.deepStrictEqual(derefed.properties?.ratio?.enum, ["16:9", "9:16", "1:1"]);
  assert.strictEqual(derefed.properties?.ratio?.default, "16:9");
});

test("partitionSchema correctly separates Media Port Handles from Schema-Driven Parameters", () => {
  const schema: OpenAPISchema = {
    type: "object",
    required: ["prompt"],
    properties: {
      prompt: {
        type: "string",
        description: "Text prompt for generation",
        maxLength: 5000,
      },
      image_input: {
        type: "array",
        description: "Reference images array",
        items: { type: "string", format: "uri" },
        maxItems: 8,
      },
      first_frame_image: {
        type: "string",
        description: "First frame image URL",
        format: "uri",
      },
      video_ref: {
        type: "string",
        description: "Motion reference video URL",
      },
      audio_url: {
        type: "string",
        description: "Background audio URL",
      },
      aspect_ratio: {
        type: "string",
        description: "Aspect ratio",
        enum: ["1:1", "16:9", "9:16"],
        default: "1:1",
      },
      duration: {
        type: "integer",
        description: "Duration in seconds",
        minimum: 5,
        maximum: 10,
        default: 5,
      },
      sound: {
        type: "boolean",
        description: "Enable sound effects",
        default: true,
      },
      seed: {
        type: "integer",
        description: "Random seed",
      },
      negative_prompt: {
        type: "string",
        description: "Negative prompt to avoid specific elements",
        maxLength: 2000,
      },
    },
  };

  const result = partitionSchema(schema);

  // Check Handles
  const handleKeys = result.handles.map((h) => h.key);
  assert.ok(handleKeys.includes("image_input"), "image_input should be a handle");
  assert.ok(handleKeys.includes("first_frame_image"), "first_frame_image should be a handle");
  assert.ok(handleKeys.includes("video_ref"), "video_ref should be a handle");
  assert.ok(handleKeys.includes("audio_url"), "audio_url should be a handle");

  const imageInputHandle = result.handles.find((h) => h.key === "image_input");
  assert.strictEqual(imageInputHandle?.type, "image");
  assert.strictEqual(imageInputHandle?.isArray, true);
  assert.strictEqual(imageInputHandle?.maxCount, 8);

  const videoHandle = result.handles.find((h) => h.key === "video_ref");
  assert.strictEqual(videoHandle?.type, "video");
  assert.strictEqual(videoHandle?.isArray, false);

  const audioHandle = result.handles.find((h) => h.key === "audio_url");
  assert.strictEqual(audioHandle?.type, "audio");

  // Check Parameters
  const paramKeys = result.parameters.map((p) => p.key);
  assert.ok(paramKeys.includes("aspect_ratio"), "aspect_ratio should be a parameter");
  assert.ok(paramKeys.includes("duration"), "duration should be a parameter");
  assert.ok(paramKeys.includes("sound"), "sound should be a parameter");
  assert.ok(paramKeys.includes("seed"), "seed should be a parameter");
  assert.ok(paramKeys.includes("negative_prompt"), "negative_prompt should be a parameter");

  // Handles must not be in parameters
  assert.ok(!paramKeys.includes("image_input"), "handles must not be in parameters");
  assert.ok(!paramKeys.includes("first_frame_image"), "handles must not be in parameters");
  assert.ok(!paramKeys.includes("video_ref"), "handles must not be in parameters");

  // Controls check
  const ratioParam = result.parameters.find((p) => p.key === "aspect_ratio");
  assert.strictEqual(ratioParam?.control, "dropdown");
  assert.deepStrictEqual(
    ratioParam?.enum?.map((e) => e.value),
    ["1:1", "16:9", "9:16"]
  );

  const durationParam = result.parameters.find((p) => p.key === "duration");
  assert.strictEqual(durationParam?.control, "slider");
  assert.strictEqual(durationParam?.min, 5);
  assert.strictEqual(durationParam?.max, 10);
  assert.strictEqual(durationParam?.default, 5);

  const soundParam = result.parameters.find((p) => p.key === "sound");
  assert.strictEqual(soundParam?.control, "toggle");
  assert.strictEqual(soundParam?.default, true);

  const seedParam = result.parameters.find((p) => p.key === "seed");
  assert.strictEqual(seedParam?.control, "number");

  const negPromptParam = result.parameters.find((p) => p.key === "negative_prompt");
  assert.strictEqual(negPromptParam?.control, "textarea");

  // Aspect ratio metadata
  assert.strictEqual(result.aspectRatioKey, "aspect_ratio");
  assert.deepStrictEqual(result.ratios, ["1:1", "16:9", "9:16"]);
  assert.strictEqual(result.defaultAspectRatio, "1:1");
});
