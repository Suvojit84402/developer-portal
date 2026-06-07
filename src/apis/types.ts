export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export interface OpenAPISchema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  required?: string[];
  enum?: string[];
  nullable?: boolean;
  allOf?: OpenAPISchema[];
  $ref?: string;
  example?: unknown;
  default?: unknown;
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: OpenAPISchema;
  example?: unknown;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: Record<
    string,
    {
      schema?: OpenAPISchema;
      example?: unknown;
    }
  >;
}

export interface OpenAPIResponse {
  description: string;
  content?: Record<
    string,
    {
      schema?: OpenAPISchema;
      example?: unknown;
    }
  >;
}

export interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
}

export interface OpenAPIObject {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  paths: Record<string, Partial<Record<HttpMethod, OpenAPIOperation>>>;
  components?: {
    schemas?: Record<string, OpenAPISchema>;
    securitySchemes?: Record<string, unknown>;
  };
}

export type ChangelogEntryType = 'Breaking' | 'Feature' | 'Fix';

export interface ChangelogEntry {
  version: string;
  date: string;
  type: ChangelogEntryType;
  description: string;
}

export interface SdkLink {
  lang: string;
  install: string;
  repo: string;
}

export interface ApiDefinition {
  id: string;
  name: string;
  version: string;
  spec: OpenAPIObject;
  docsFile?: string;
  docsContent?: string;
  changelog?: ChangelogEntry[];
  sdks?: SdkLink[];
  baseUrl: string;
  baseUrls?: {
    sandbox: string;
    staging: string;
    production: string;
  };
}

export interface EndpointDef {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses: Record<string, OpenAPIResponse>;
}

export type ApiHealthStatus = 'operational' | 'degraded' | 'outage';

export interface ApiStatusInfo {
  status: ApiHealthStatus;
  uptimePercent: number;
}

export interface Incident {
  id: string;
  apiId: string;
  title: string;
  status: ApiHealthStatus;
  startedAt: string;
  resolvedAt?: string;
  description: string;
  resolution?: string;
}

export interface ErrorReference {
  code: string;
  httpStatus: number;
  description: string;
  causes: string[];
  resolution: string;
}
