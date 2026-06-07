import { describe, expect, it } from 'vitest';
import pokeapiSpec from '@/apis/pokeapi/openapi.json';
import type { OpenAPIObject } from '@/apis/types';
import { parseSpec, searchEndpoints } from '@/lib/spec-parser';
import { buildRequestUrl, generateCurl } from '@/lib/snippet-generator';

describe('spec-parser', () => {
  it('parses pokeapi endpoints from OpenAPI spec', () => {
    const endpoints = parseSpec(pokeapiSpec as OpenAPIObject);
    expect(endpoints.length).toBeGreaterThan(0);
    expect(endpoints.some((endpoint) => endpoint.operationId === 'getPokemon')).toBe(true);
  });

  it('searches endpoints by path fragment', () => {
    const results = searchEndpoints(pokeapiSpec as OpenAPIObject, 'pokemon');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('snippet-generator', () => {
  it('builds request URLs with path and query params', () => {
    const url = buildRequestUrl(
      'https://pokeapi.co/api/v2',
      '/pokemon/{idOrName}',
      { idOrName: 'pikachu' },
      { limit: '10' },
    );
    expect(url).toContain('/pokemon/pikachu');
  });

  it('generates a curl command with auth header', () => {
    const curl = generateCurl({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/pokemon/pikachu',
      headers: { Authorization: 'Bearer test-token' },
    });
    expect(curl).toContain('curl');
    expect(curl).toContain('Authorization: Bearer test-token');
  });
});
