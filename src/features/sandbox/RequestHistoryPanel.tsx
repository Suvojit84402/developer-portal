import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRequestHistoryStore } from '@/lib/stores';
import { formatDateTime } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function RequestHistoryPanel() {
  const entries = useRequestHistoryStore((state) => state.entries);
  const clearEntries = useRequestHistoryStore((state) => state.clearEntries);
  const navigate = useNavigate();

  function exportHar() {
    const har = {
      log: {
        version: '1.2',
        creator: { name: 'Developer Portal', version: '1.0.0' },
        entries: entries.map((entry) => ({
          startedDateTime: entry.timestamp,
          time: entry.latencyMs ?? 0,
          request: {
            method: entry.method,
            url: entry.url,
            headers: Object.entries(entry.headers).map(([name, value]) => ({ name, value })),
            postData: entry.body
              ? { mimeType: 'application/json', text: entry.body }
              : undefined,
          },
          response: {
            status: entry.status ?? 0,
            content: {
              mimeType: 'application/json',
              text: entry.responseBody ?? '',
            },
          },
        })),
      },
    };

    const blob = new Blob([JSON.stringify(har, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'sandbox-history.har';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No sandbox requests yet"
        description="Send a request from the sandbox to populate this session history."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={exportHar}>
          Export HAR
        </Button>
        <Button size="sm" variant="ghost" onClick={clearEntries}>
          Clear history
        </Button>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {entry.method} {entry.url}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(entry.timestamp)}
                  {entry.status ? ` · ${entry.status}` : ''}
                  {entry.latencyMs ? ` · ${entry.latencyMs} ms` : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (entry.apiId && entry.operationId) {
                    navigate(`/sandbox/${entry.apiId}/${entry.operationId}`);
                  }
                }}
              >
                Replay
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
