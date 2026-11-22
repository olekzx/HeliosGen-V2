import test from "node:test";
import assert from "node:assert";
import {
  getCatalog,
  getImageModels,
  getVideoModels,
  getModelById,
  catalogModelToImageModel,
  catalogModelToVideoModel,
} from "../lib/models/catalog.ts";

test("getCatalog returns compiled catalog with models", () => {
  const catalog = getCatalog();
  assert.ok(catalog.version, "catalog should have a version");
  assert.ok(catalog.models.length > 0, "catalog should contain models");
});

test("getImageModels and getVideoModels filter by modality", () => {
  const images = getImageModels();
  const videos = getVideoModels();

  assert.ok(images.length > 0, "should have image models");
  assert.ok(videos.length > 0, "should have video models");

  for (const img of images) {
    assert.strictEqual(img.modality, "image");
    assert.ok(img.id, "model must have an id");
    assert.ok(img.name, "model must have a name");
  }

  for (const vid of videos) {
    assert.strictEqual(vid.modality, "video");
    assert.ok(vid.id, "model must have an id");
    assert.ok(vid.name, "model must have a name");
  }
});

test("getModelById finds models by id or model slug", () => {
  const all = getCatalog().models;
  const first = all[0];
  const found = getModelById(first.id);
  assert.strictEqual(found?.id, first.id);
  assert.strictEqual(found?.name, first.name);
});

test("catalogModelToImageModel converts CatalogModel to valid ImageModel", () => {
  const imgModels = getImageModels();
  assert.ok(imgModels.length > 0);
  const converted = catalogModelToImageModel(imgModels[0]);
  assert.ok(converted.id);
  assert.ok(converted.name);
  assert.ok(converted.provider);
  assert.ok(Array.isArray(converted.ratios));
  assert.ok(converted.apiInput.aspectRatioKey);
});

test("catalogModelToVideoModel converts CatalogModel to valid VideoModel", () => {
  const vidModels = getVideoModels();
  assert.ok(vidModels.length > 0);
  const converted = catalogModelToVideoModel(vidModels[0]);
  assert.ok(converted.id);
  assert.ok(converted.name);
  assert.ok(converted.provider);
  assert.ok(Array.isArray(converted.ratios));
  assert.ok(Array.isArray(converted.handles));
});

