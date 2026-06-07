import type { ApiDefinition, ChangelogEntry, OpenAPIObject } from './types';
import pokeapiSpec from './pokeapi/openapi.json';
import pokeapiChangelog from './pokeapi/changelog.json';
import pokeapiDocs from './pokeapi/docs.md?raw';
import paymentsSpec from './stub-payments/openapi.json';
import paymentsChangelog from './stub-payments/changelog.json';

export type { ApiDefinition, ChangelogEntry, EndpointDef, SdkLink } from './types';

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: 'pokeapi',
    name: 'PokéAPI',
    version: '2.0.0',
    spec: pokeapiSpec as OpenAPIObject,
    docsContent: pokeapiDocs,
    changelog: pokeapiChangelog as ChangelogEntry[],
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm install pokeapi-v2',
        repo: 'https://github.com/PokeAPI/pokeapi-js-wrapper',
      },
      {
        lang: 'Python',
        install: 'pip install pokebase',
        repo: 'https://github.com/pokeapi/pokebase',
      },
      {
        lang: 'Ruby',
        install: 'gem install poke-api-v2',
        repo: 'https://github.com/nickeltode/poke-api-v2',
      },
    ],
    baseUrl: 'https://pokeapi.co/api/v2',
    baseUrls: {
      sandbox: 'https://pokeapi.co/api/v2',
      staging: 'https://pokeapi.co/api/v2',
      production: 'https://pokeapi.co/api/v2',
    },
  },
  {
    id: 'stub-payments',
    name: 'Payments API',
    version: '1.0.0',
    spec: paymentsSpec as OpenAPIObject,
    changelog: paymentsChangelog as ChangelogEntry[],
    sdks: [
      {
        lang: 'Node.js',
        install: 'npm install @example/payments-sdk',
        repo: 'https://github.com/example/payments-sdk',
      },
    ],
    baseUrl: 'https://api.example.com/v1',
    baseUrls: {
      sandbox: 'https://sandbox.api.example.com/v1',
      staging: 'https://staging.api.example.com/v1',
      production: 'https://api.example.com/v1',
    },
  },
];

export function getApiById(apiId: string): ApiDefinition | undefined {
  return API_REGISTRY.find((api) => api.id === apiId);
}

export const ERROR_REFERENCE = [
  {
    code: 'UNAUTHORIZED',
    httpStatus: 401,
    description: 'Authentication credentials are missing or invalid.',
    causes: ['Expired JWT token', 'Missing Authorization header', 'Invalid API key'],
    resolution: 'Refresh your session or verify your API key is correct and not revoked.',
  },
  {
    code: 'FORBIDDEN',
    httpStatus: 403,
    description: 'You do not have permission to access this resource.',
    causes: ['Insufficient scope', 'Production key used in sandbox environment'],
    resolution: 'Verify your API key environment matches the target endpoint.',
  },
  {
    code: 'NOT_FOUND',
    httpStatus: 404,
    description: 'The requested resource does not exist.',
    causes: ['Invalid path parameter', 'Deleted or expired resource'],
    resolution: 'Check the resource ID and ensure it exists.',
  },
  {
    code: 'RATE_LIMITED',
    httpStatus: 429,
    description: 'Too many requests in the current rate-limit window.',
    causes: ['High request volume', 'Missing caching strategy'],
    resolution: 'Wait for the rate-limit reset window or implement exponential backoff.',
  },
  {
    code: 'VALIDATION_ERROR',
    httpStatus: 400,
    description: 'The request body or parameters failed validation.',
    causes: ['Missing required field', 'Invalid data type', 'Out-of-range value'],
    resolution: 'Review the endpoint schema and correct invalid fields.',
  },
  {
    code: 'INTERNAL_ERROR',
    httpStatus: 500,
    description: 'An unexpected server error occurred.',
    causes: ['Upstream service failure', 'Temporary outage'],
    resolution: 'Retry with exponential backoff. Check the status page for active incidents.',
  },
];
