import { ERROR_REFERENCE, getApiById } from '@/apis/api-registry';
import type { OpenAPIObject } from '@/apis/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MethodBadge } from '@/components/ui/MethodBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSchemaType, parseSpec, resolveSchema } from '@/lib/spec-parser';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

export function DocsPage() {
  const { apiId, operationId } = useParams();
  const api = apiId ? getApiById(apiId) : undefined;

  if (!api) {
    return (
      <ErrorState message="The requested API was not found in the registry." />
    );
  }

  const endpoints = parseSpec(api.spec);
  const endpoint = operationId
    ? endpoints.find((item) => item.operationId === operationId)
    : undefined;

  const grouped = endpoints.reduce<Record<string, typeof endpoints>>((acc, item) => {
    const tag = item.tags[0] ?? 'General';
    acc[tag] = acc[tag] ? [...acc[tag], item] : [item];
    return acc;
  }, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{api.name}</h2>
          <p className="text-sm text-muted-foreground">v{api.version}</p>
        </div>
        {Object.entries(grouped).map(([tag, items]) => (
          <div key={tag}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tag}
            </p>
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.operationId}
                  to={`/docs/${api.id}/${item.operationId}`}
                  className={`block rounded-md px-2 py-2 text-sm hover:bg-muted ${
                    item.operationId === operationId ? 'bg-muted text-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MethodBadge method={item.method} className="min-w-14" />
                    <span className="truncate">{item.summary ?? item.operationId}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <section className="space-y-8">
        {!operationId ? (
          <>
            <div className="rounded-xl border border-border bg-card p-6">
              <h1 className="text-2xl font-semibold">Getting Started</h1>
              {api.docsContent ? (
                <div className="markdown mt-4 max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{api.docsContent}</ReactMarkdown>
                </div>
              ) : (
                <EmptyState
                  title="No getting started guide"
                  description="Add a docs.md file to this API folder to populate this section."
                />
              )}
            </div>
            {api.sdks?.length ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">SDKs & Libraries</h2>
                <div className="mt-4 space-y-3">
                  {api.sdks.map((sdk) => (
                    <div
                      key={sdk.lang}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{sdk.lang}</p>
                          <p className="text-sm text-muted-foreground">{sdk.install}</p>
                        </div>
                        <a
                          href={sdk.repo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Repository
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <ErrorReferenceSection />
          </>
        ) : endpoint ? (
          <EndpointDetail apiId={api.id} endpoint={endpoint} spec={api.spec} />
        ) : (
          <ErrorState message="Endpoint not found in the OpenAPI specification." />
        )}
      </section>
    </div>
  );
}

function ErrorReferenceSection() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Error Reference</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">HTTP</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Resolution</th>
            </tr>
          </thead>
          <tbody>
            {ERROR_REFERENCE.map((error) => (
              <tr key={error.code} className="border-b border-border/70">
                <td className="px-3 py-3 font-medium">{error.code}</td>
                <td className="px-3 py-3">{error.httpStatus}</td>
                <td className="px-3 py-3">{error.description}</td>
                <td className="px-3 py-3 text-muted-foreground">{error.resolution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EndpointDetail({
  apiId,
  endpoint,
  spec,
}: {
  apiId: string;
  endpoint: ReturnType<typeof parseSpec>[number];
  spec: OpenAPIObject;
}) {
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
        {endpoint.description ? (
          <p className="mt-2 text-muted-foreground">{endpoint.description}</p>
        ) : null}
        <div className="mt-4">
          <Link to={`/sandbox/${apiId}/${endpoint.operationId}`}>
            <Button>Try in Sandbox</Button>
          </Link>
        </div>
      </div>

      {endpoint.parameters.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Parameters</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">In</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Required</th>
                  <th className="px-3 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((param) => (
                  <tr key={`${param.in}-${param.name}`} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium">{param.name}</td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{param.in}</Badge>
                    </td>
                    <td className="px-3 py-3">{formatSchemaType(param.schema)}</td>
                    <td className="px-3 py-3">{param.required ? 'Yes' : 'No'}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {param.description ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {endpoint.requestBody ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Request Body</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {endpoint.requestBody.description ?? 'JSON request payload'}
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-muted/40 p-4 text-sm">
            {JSON.stringify(
              resolveSchema(
                spec,
                endpoint.requestBody.content['application/json']?.schema,
              ),
              null,
              2,
            )}
          </pre>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Responses</h2>
        <div className="mt-4 space-y-4">
          {Object.entries(endpoint.responses).map(([status, response]) => (
            <div key={status} className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <Badge>{status}</Badge>
                <span>{response.description}</span>
              </div>
              {response.content?.['application/json']?.schema ? (
                <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/40 p-4 text-sm">
                  {JSON.stringify(
                    resolveSchema(spec, response.content['application/json'].schema),
                    null,
                    2,
                  )}
                </pre>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DocsPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
