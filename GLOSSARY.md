# HeliosGen Generative Workflow Engine

HeliosGen is a visual node-based generative AI workflow engine and desktop/web studio for chaining multimodal models into production creative pipelines.

## Language

### Models & Schema

**Model Catalog**:
The compiled registry of all AI generation models, their modalities, schemas, and provider capabilities available within HeliosGen.
_Avoid_: Model list, model registry, model database

**Schema-Driven Parameter**:
A model-specific configurable attribute defined by an OpenAPI schema whose input control is dynamically rendered in the studio UI.
_Avoid_: Dynamic setting, custom field, model option, extra parameter

**Dynamic Parameter Inspector**:
The collapsible node studio panel that dynamically renders form controls for all scalar parameters declared in a model's schema.
_Avoid_: Property grid, options drawer, setting panel, inspector modal

### Canvas & Execution

**Media Port Handle**:
A directional visual socket on a node card representing a connectable image, video, or audio stream wired between canvas nodes.
_Avoid_: Socket, pin, connection point, input slot

**Task Polling**:
The asynchronous querying cycle against an upstream generative provider using a unique task identifier until reaching a terminal state.
_Avoid_: Job checking, status loop, record fetch, poller cycle
