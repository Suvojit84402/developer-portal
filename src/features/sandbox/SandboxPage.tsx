import { getApiById } from '@/apis/api-registry';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/useAuth';
import {
  buildRequestUrl,
  generateCurl,
  generateFetch,
  generatePython,
} from '@/lib/snippet-generator';
import { getEndpointByOperationId, schemaToExample } from '@/lib/spec-parser';
import { useEnvironmentStore, useApiKeyStore, useRequestHistoryStore } from '@/lib/stores';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

type SnippetTab = 'curl' | 'fetch' | 'python';

export function SandboxPage() {
  const { apiId, operationId } = useParams();
  const { token } = useAuth();
  const { environment } = useEnvironmentStore();
  const addHistoryEntry = useRequestHistoryStore((state) => state.addEntry);
  const apiKeys = useApiKeyStore((state) => state.keys);
  const markKeyUsed = useApiKeyStore((state) => state.markKeyUsed);
  const api = apiId ? getApiById(apiId) : undefined;
  const endpoint =
    api && operationId ? getEndpointByOperationId(api.spec, operationId) : undefined;

  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({
    Accept: 'application/json',
  });
  const [body, setBody] = useState('{}');
  const [snippetTab, setSnippetTab] = useState<SnippetTab>('curl');

  useEffect(() => {
    if (!api || !operationId) {
      return;
    }

    const currentEndpoint = getEndpointByOperationId(api.spec, operationId);
    if (!currentEndpoint) {
      return;
    }

    const nextPathParams: Record<string, string> = {};
    const nextQueryParams: Record<string, string> = {};

    for (const param of currentEndpoint.parameters) {
      if (param.in === 'path') {
        nextPathParams[param.name] = String(param.example ?? param.schema?.example ?? '');
      }
      if (param.in === 'query') {
        nextQueryParams[param.name] = String(
          param.schema?.default ?? param.example ?? '',
        );
      }
    }

    setPathParams(nextPathParams);
    setQueryParams(nextQueryParams);

    if (currentEndpoint.requestBody) {
      const schema = currentEndpoint.requestBody.content['application/json']?.schema;
      setBody(JSON.stringify(schemaToExample(schema), null, 2));
    } else {
      setBody('{}');
    }
  }, [api, operationId]);

  const baseUrl = useMemo(() => {
    if (!api) {
      return '';
    }
    return api.baseUrls?.[environment] ?? api.baseUrl;
  }, [api, environment]);

  const activeApiKey = useMemo(() => {
    const keyEnvironment = environment === 'production' ? 'production' : 'sandbox';
    return apiKeys.find(
      (key) => !key.revoked && key.environment === keyEnvironment && key.fullKey,
    );
  }, [apiKeys, environment]);

  const requestUrl = useMemo(() => {
    if (!endpoint) {
      return '';
    }
    return buildRequestUrl(baseUrl, endpoint.path, pathParams, queryParams);
  }, [baseUrl, endpoint, pathParams, queryParams]);

  const requestHeaders = useMemo(() => {
    const next = { ...headers };
    if (token) {
      next.Authorization = `Bearer ${token}`;
    } else if (activeApiKey?.fullKey) {
      next.Authorization = `Bearer ${activeApiKey.fullKey}`;
    }
    if (endpoint?.requestBody) {
      next['Content-Type'] = 'application/json';
    }
    return next;
  }, [headers, token, activeApiKey, endpoint]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!endpoint) {
        throw new Error('Endpoint not found');
      }

      const started = performance.now();
      const response = await fetch(requestUrl, {
        method: endpoint.method.toUpperCase(),
        headers: requestHeaders,
        body:
          endpoint.requestBody && endpoint.method !== 'get'
            ? body
            : undefined,
      });

      const latencyMs = Math.round(performance.now() - started);
      const text = await response.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      const formatted = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);

      if (!token && activeApiKey) {
        markKeyUsed(activeApiKey.id);
      }

      addHistoryEntry({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        apiId,
        operationId,
        method: endpoint.method.toUpperCase(),
        url: requestUrl,
        headers: requestHeaders,
        body: endpoint.requestBody ? body : undefined,
        status: response.status,
        latencyMs,
        responseBody: formatted,
      });

      return {
        status: response.status,
        latencyMs,
        body: formatted,
      };
    },
  });

  const snippet = useMemo(() => {
    const request = {
      method: endpoint?.method.toUpperCase() ?? 'GET',
      url: requestUrl,
      headers: requestHeaders,
      body: endpoint?.requestBody ? body : undefined,
    };

    switch (snippetTab) {
      case 'fetch':
        return generateFetch(request);
      case 'python':
        return generatePython(request);
      default:
        return generateCurl(request);
    }
  }, [snippetTab, endpoint, requestUrl, requestHeaders, body]);

  if (!api || !endpoint) {
    return (
      <ErrorState title="Sandbox Unavailable" message="Sandbox endpoint not found." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm">{endpoint.path}</code>
        </div>
        <h1 className="mt-4 text-2xl font-semibold">
          {endpoint.summary ?? endpoint.operationId}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{requestUrl}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Request Builder</h2>
          {endpoint.parameters
            .filter((param) => param.in === 'path')
            .map((param) => (
              <Input
                key={param.name}
                label={`Path: ${param.name}`}
                value={pathParams[param.name] ?? ''}
                onChange={(event) =>
                  setPathParams((current) => ({
                    ...current,
                    [param.name]: event.target.value,
                  }))
                }
              />
            ))}
          {endpoint.parameters
            .filter((param) => param.in === 'query')
            .map((param) => (
              <Input
                key={param.name}
                label={`Query: ${param.name}`}
                value={queryParams[param.name] ?? ''}
                onChange={(event) =>
                  setQueryParams((current) => ({
                    ...current,
                    [param.name]: event.target.value,
                  }))
                }
              />
            ))}
          <Input
            label="Accept header"
            value={headers.Accept ?? ''}
            onChange={(event) =>
              setHeaders((current) => ({ ...current, Accept: event.target.value }))
            }
          />
          {endpoint.requestBody ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">JSON Body</label>
              <CodeMirror
                value={body}
                height="200px"
                extensions={[json()]}
                onChange={setBody}
              />
            </div>
          ) : null}
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Response</h2>
          {mutation.isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : null}
          {mutation.isError ? (
            <ErrorState
              title="Request Failed"
              message="The sandbox request failed. Check your parameters and try again."
            />
          ) : null}
          {mutation.data ? (
            <>
              <div className="flex items-center gap-3">
                <StatusBadge status={mutation.data.status} />
                <span className="text-sm text-muted-foreground">
                  {mutation.data.latencyMs} ms
                </span>
              </div>
              <CodeBlock code={mutation.data.body} />
            </>
          ) : null}
          {!mutation.isPending && !mutation.data && !mutation.isError ? (
            <EmptyState
              title="No response yet"
              description="Configure your request and click Send Request to see a live API response."
            />
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex gap-2">
          {(['curl', 'fetch', 'python'] as SnippetTab[]).map((tab) => (
            <Button
              key={tab}
              variant={snippetTab === tab ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSnippetTab(tab)}
            >
              {tab === 'curl' ? 'cURL' : tab === 'fetch' ? 'JavaScript' : 'Python'}
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <CodeBlock
            code={snippet}
            language={snippetTab === 'python' ? 'python' : snippetTab === 'fetch' ? 'javascript' : 'bash'}
          />
        </div>
      </div>
    </div>
  );
}
