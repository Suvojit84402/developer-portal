export interface SnippetRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

function escapeShell(value: string): string {
  return value.replace(/'/g, `'\\''`);
}

function serializeHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `-H '${escapeShell(`${key}: ${value}`)}'`)
    .join(' \\\n  ');
}

export function generateCurl(request: SnippetRequest): string {
  const parts = [`curl -X ${request.method.toUpperCase()} '${escapeShell(request.url)}'`];

  const headerLine = serializeHeaders(request.headers);
  if (headerLine) {
    parts.push(`  ${headerLine}`);
  }

  if (request.body && request.method.toUpperCase() !== 'GET') {
    parts.push(`  -d '${escapeShell(request.body)}'`);
  }

  return parts.join(' \\\n');
}

export function generateFetch(request: SnippetRequest): string {
  const headers = Object.entries(request.headers).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {},
  );

  const options: Record<string, unknown> = {
    method: request.method.toUpperCase(),
    headers,
  };

  if (request.body && request.method.toUpperCase() !== 'GET') {
    options.body = request.body;
  }

  return `const response = await fetch('${request.url}', ${JSON.stringify(options, null, 2)});\nconst data = await response.json();\nconsole.log(data);`;
}

export function generatePython(request: SnippetRequest): string {
  const headerLines = Object.entries(request.headers)
    .map(([key, value]) => `    "${key}": "${value.replace(/"/g, '\\"')}",`)
    .join('\n');

  const bodyBlock =
    request.body && request.method.toUpperCase() !== 'GET'
      ? `\njson_payload = ${request.body}\nresponse = requests.${request.method.toLowerCase()}(\n    "${request.url}",\n    headers=headers,\n    json=json_payload,\n)`
      : `\nresponse = requests.${request.method.toLowerCase()}(\n    "${request.url}",\n    headers=headers,\n)`;

  return `import requests\n\nheaders = {\n${headerLines}\n}\n${bodyBlock}\nprint(response.json())`;
}

export function buildRequestUrl(
  baseUrl: string,
  path: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
): string {
  let resolvedPath = path;

  for (const [key, value] of Object.entries(pathParams)) {
    resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(value));
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== '') {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}
