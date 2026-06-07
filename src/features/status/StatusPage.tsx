import { API_REGISTRY } from '@/apis/api-registry';
import { formatDateTime } from '@/lib/utils';
import { HealthBadge } from '@/features/status/HealthBadge';
import { API_STATUS, INCIDENTS } from '@/features/status/status-data';

export function StatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">API Status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Current health, uptime, and incident history for all registered APIs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {API_REGISTRY.map((api) => {
          const status = API_STATUS[api.id] ?? {
            status: 'operational' as const,
            uptimePercent: 99.9,
          };
          return (
            <div key={api.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{api.name}</h2>
                <HealthBadge status={status.status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">90-day uptime</p>
              <p className="text-3xl font-semibold">{status.uptimePercent}%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${status.uptimePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Incident History</h2>
        <div className="mt-4 space-y-4">
          {INCIDENTS.map((incident) => {
            const api = API_REGISTRY.find((entry) => entry.id === incident.apiId);
            return (
              <div key={incident.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <HealthBadge status={incident.status} />
                  <span className="font-medium">{incident.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {api?.name} · {formatDateTime(incident.startedAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{incident.description}</p>
                {incident.resolution ? (
                  <p className="mt-2 text-sm">
                    <strong>Resolution:</strong> {incident.resolution}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
