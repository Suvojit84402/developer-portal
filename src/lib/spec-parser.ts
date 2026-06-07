import type {
  EndpointDef,
  HttpMethod,
  OpenAPIObject,
  OpenAPISchema,
} from '@/apis/types';

const HTTP_METHODS: HttpMethod[] = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
];

function resolveRef(spec: OpenAPIObject, ref: string): OpenAPISchema | undefined {
  if (!ref.startsWith('#/')) {
    return undefined;
  }

  const parts = ref.slice(2).split('/');
  let current: unknown = spec;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current as OpenAPISchema;
}

export function resolveSchema(spec: OpenAPIObject, schema?: OpenAPISchema): OpenAPISchema | undefined {
  if (!schema) {
    return undefined;
  }

  if (schema.$ref) {
    const resolved = resolveRef(spec, schema.$ref);
    return resolved ? resolveSchema(spec, resolved) : undefined;
  }

  if (schema.allOf?.length) {
    const merged: OpenAPISchema = { type: 'object', properties: {}, required: [] };

    for (const part of schema.allOf) {
      const resolved = resolveSchema(spec, part);
      if (!resolved) {
        continue;
      }

      merged.properties = { ...merged.properties, ...resolved.properties };
      merged.required = [...(merged.required ?? []), ...(resolved.required ?? [])];
      if (resolved.type) {
        merged.type = resolved.type;
      }
      if (resolved.description) {
        merged.description = resolved.description;
      }
    }

    return merged;
  }

  return schema;
}

export function parseSpec(spec: OpenAPIObject): EndpointDef[] {
  const endpoints: EndpointDef[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      endpoints.push({
        operationId: operation.operationId ?? `${method}-${path}`,
        method,
        path,
        summary: operation.summary,
        description: operation.description,
        tags: operation.tags ?? ['General'],
        parameters: operation.parameters ?? [],
        requestBody: operation.requestBody,
        responses: operation.responses ?? {},
      });
    }
  }

  return endpoints;
}

export function getEndpointByOperationId(
  spec: OpenAPIObject,
  operationId: string,
): EndpointDef | undefined {
  return parseSpec(spec).find((endpoint) => endpoint.operationId === operationId);
}

export function searchEndpoints(
  spec: OpenAPIObject,
  query: string,
): EndpointDef[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return parseSpec(spec).filter((endpoint) => {
    const haystack = [
      endpoint.operationId,
      endpoint.path,
      endpoint.summary,
      endpoint.description,
      ...endpoint.tags,
      ...endpoint.parameters.map((param) => `${param.name} ${param.description ?? ''}`),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function schemaToExample(schema?: OpenAPISchema): unknown {
  if (!schema) {
    return undefined;
  }

  if (schema.example !== undefined) {
    return schema.example;
  }

  if (schema.enum?.length) {
    return schema.enum[0];
  }

  switch (schema.type) {
    case 'object': {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(schema.properties ?? {})) {
        result[key] = schemaToExample(value);
      }
      return result;
    }
    case 'array':
      return schema.items ? [schemaToExample(schema.items)] : [];
    case 'integer':
      return 0;
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'string':
      if (schema.format === 'date-time') {
        return new Date().toISOString();
      }
      return '';
    default:
      return null;
  }
}

export function formatSchemaType(schema?: OpenAPISchema): string {
  if (!schema) {
    return 'unknown';
  }

  if (schema.$ref) {
    return schema.$ref.split('/').pop() ?? 'ref';
  }

  if (schema.allOf?.length) {
    return schema.allOf.map((part) => formatSchemaType(part)).join(' & ');
  }

  if (schema.type === 'array' && schema.items) {
    return `array<${formatSchemaType(schema.items)}>`;
  }

  if (schema.enum?.length) {
    return `enum(${schema.enum.join(' | ')})`;
  }

  return schema.format ? `${schema.type} (${schema.format})` : (schema.type ?? 'unknown');
}
