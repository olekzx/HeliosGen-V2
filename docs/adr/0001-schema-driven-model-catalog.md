# Schema-Driven Model Catalog and Dynamic Parameter Inspector

To support the full catalog of 200+ Kie.ai generative image and video models without manual code maintenance, we will synchronize OpenAPI schemas at build time into a precompiled local catalog and render all model-specific parameters through a schema-driven Dynamic Parameter Inspector.

## Status

Accepted

## Context

Kie.ai hosts over 200 generative models with frequently updated parameters, options, and endpoints. In HeliosGen, models have historically been hardcoded in `lib/modelConfig.ts` with custom UI controls for a handful of known parameters (e.g., `klingMode`, `grokResolution`). Manually maintaining UI components and config entries for 200+ models is unmaintainable, while querying Kie.ai's schema endpoints dynamically on client startup is blocked by strict 1 req/sec rate limits and breaks offline/desktop usage.

## Decision

1. **Build-Time Schema Synchronization**: We will use a Node.js sync script to query Kie.ai's `/api/v1/models` and `/api/v1/models/{model}/schema` endpoints, de-reference OpenAPI `$ref` properties, and compile a typed, static `lib/models/kie-catalog.json`.
2. **Handle vs Parameter Partitioning**: Schemas are automatically parsed to separate connectable media inputs (`image_url`, `video_url`, etc.) into Media Port Handles on the canvas from scalar properties (numbers, strings, enums, booleans) which are passed to the UI.
3. **Dynamic Parameter Inspector**: We will replace hardcoded per-model settings with a generic, schema-driven inspector that reads property definitions and renders sliders, dropdowns, inputs, and toggles bound to `node.data.params`.
4. **Universal Serialization**: The execution routes (`app/api/generate/route.ts`) will forward the validated `params` map directly into the upstream `createTask.input` payload.

## Considered Options

- **Hardcoded Component Extensions**: Continue writing bespoke TypeScript objects and React controls for each new model. Rejected due to extreme maintenance overhead and fragility as Kie evolves.
- **Client-Side Live Schema Fetching**: Query Kie.ai's OpenAPI schema endpoints on-demand from the browser. Rejected because Kie limits discovery endpoints to 1 request/second and users without an immediate API key or offline desktop instances would fail to render models.

## Consequences

- Any newly released Kie.ai model can be integrated simply by re-running the sync script.
- Canvas nodes remain lightweight while gaining access to 100% of each model's native OpenAPI parameters.
- Offline desktop packaging (Tauri) retains full catalog metadata without network calls on launch.
