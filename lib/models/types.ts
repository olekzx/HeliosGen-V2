export interface OpenAPISchemaProperty {
  type?: string;
  description?: string;
  title?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  items?: OpenAPISchemaProperty | { type?: string; $ref?: string };
  format?: string;
  $ref?: string;
  oneOf?: OpenAPISchemaProperty[];
  anyOf?: OpenAPISchemaProperty[];
  allOf?: OpenAPISchemaProperty[];
  properties?: Record<string, OpenAPISchemaProperty>;
  required?: string[];
  [key: string]: unknown;
}

export interface OpenAPISchema {
  type?: string;
  properties?: Record<string, OpenAPISchemaProperty | undefined>;
  required?: string[];
  definitions?: Record<string, OpenAPISchemaProperty | undefined>;
  components?: {
    schemas?: Record<string, OpenAPISchemaProperty | undefined>;
  };
  [key: string]: unknown;
}

export type MediaHandleType = "image" | "video" | "audio";

export interface MediaPortHandle {
  key: string;
  type: MediaHandleType;
  title: string;
  description?: string;
  required: boolean;
  isArray: boolean;
  maxCount?: number;
}

export type ParameterControl = "dropdown" | "slider" | "number" | "toggle" | "text" | "textarea";

export interface ParameterEnumOption {
  label: string;
  value: string | number;
}

export interface CatalogParameter {
  key: string;
  type: "string" | "number" | "integer" | "boolean" | "array";
  control: ParameterControl;
  title: string;
  description?: string;
  required: boolean;
  default?: unknown;
  enum?: ParameterEnumOption[];
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
}

export interface CatalogModel {
  id: string;
  model: string;
  name: string;
  provider: string;
  modality: "image" | "video" | "audio" | "chat";
  taskType: string[];
  description?: string;
  coverLink?: string;
  schema: OpenAPISchema;
  handles: MediaPortHandle[];
  parameters: CatalogParameter[];
  aspectRatioKey?: string;
  defaultAspectRatio?: string;
  ratios?: string[];
}

export interface KieCatalog {
  version: string;
  generatedAt: string;
  models: CatalogModel[];
}
