import { API_REGISTRY } from '@/apis/api-registry';
import { parseSpec } from '@/lib/spec-parser';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MethodBadge } from './MethodBadge';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return API_REGISTRY.flatMap((api) =>
      parseSpec(api.spec)
        .filter((endpoint) => {
          const haystack = [
            endpoint.operationId,
            endpoint.path,
            endpoint.summary,
            endpoint.description,
            ...endpoint.tags,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return haystack.includes(normalized);
        })
        .map((endpoint) => ({ api, endpoint })),
    ).slice(0, 12);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) {
          onClose();
        }
      }
      if (event.key === 'Escape' && open) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border p-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints, paths, descriptions..."
            className="w-full bg-transparent text-base outline-none"
            aria-label="Search endpoints"
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {query ? 'No matching endpoints found.' : 'Start typing to search the API catalogue.'}
            </p>
          ) : (
            results.map(({ api, endpoint }) => (
              <button
                key={`${api.id}-${endpoint.operationId}`}
                type="button"
                className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left hover:bg-muted"
                onClick={() => {
                  navigate(`/docs/${api.id}/${endpoint.operationId}`);
                  onClose();
                }}
              >
                <MethodBadge method={endpoint.method} />
                <div>
                  <p className="font-medium">{endpoint.summary ?? endpoint.operationId}</p>
                  <p className="text-sm text-muted-foreground">
                    {api.name} · {endpoint.path}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
