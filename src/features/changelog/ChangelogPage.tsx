import { API_REGISTRY } from '@/apis/api-registry';
import type { ChangelogEntryType } from '@/apis/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getChangelogTypeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

const entryTypes: ChangelogEntryType[] = ['Breaking', 'Feature', 'Fix'];

export function ChangelogPage() {
  const [selectedApis, setSelectedApis] = useState<string[]>(
    API_REGISTRY.map((api) => api.id),
  );
  const [selectedTypes, setSelectedTypes] = useState<ChangelogEntryType[]>([
    ...entryTypes,
  ]);

  const entries = useMemo(() => {
    return API_REGISTRY.flatMap((api) =>
      (api.changelog ?? []).map((entry) => ({
        ...entry,
        apiId: api.id,
        apiName: api.name,
      })),
    )
      .filter(
        (entry) =>
          selectedApis.includes(entry.apiId) && selectedTypes.includes(entry.type),
      )
      .sort(
        (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
      );
  }, [selectedApis, selectedTypes]);

  function toggleApi(apiId: string) {
    setSelectedApis((current) =>
      current.includes(apiId)
        ? current.filter((id) => id !== apiId)
        : [...current, apiId],
    );
  }

  function toggleType(type: ChangelogEntryType) {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Changelog</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Versioned release notes loaded dynamically from the API registry.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {API_REGISTRY.map((api) => (
          <button
            key={api.id}
            type="button"
            onClick={() => toggleApi(api.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm',
              selectedApis.includes(api.id)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground',
            )}
          >
            {api.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {entryTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={cn(
              'rounded-full px-3 py-1 text-sm',
              selectedTypes.includes(type)
                ? getChangelogTypeColor(type)
                : 'border border-border text-muted-foreground',
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No changelog entries"
          description="Adjust your filters or add changelog.json files to API registry entries."
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={`${entry.apiId}-${entry.version}-${entry.date}`} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={getChangelogTypeColor(entry.type)}>{entry.type}</Badge>
                <span className="font-semibold">{entry.apiName}</span>
                <span className="text-sm text-muted-foreground">v{entry.version}</span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
              <p className="mt-3 text-sm">{entry.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
