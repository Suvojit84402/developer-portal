import { API_REGISTRY } from '@/apis/api-registry';
import { parseSpec } from '@/lib/spec-parser';
import { useApiKeyStore } from '@/lib/stores';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Window = '7d' | '30d';

function seededRandom(seed: string): () => number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value + seed.charCodeAt(index) * (index + 1)) % 2147483647;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

function buildSeries(keyId: string, days: number) {
  const random = seededRandom(keyId);
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const calls = Math.round(120 + random() * 180);
    const errors = Math.round(calls * (0.02 + random() * 0.08));
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      calls,
      errors,
      latency: Math.round(80 + random() * 120),
      errorRate: Number(((errors / calls) * 100).toFixed(1)),
    };
  });
}

export function AnalyticsPage() {
  const keys = useApiKeyStore((state) => state.keys.filter((key) => !key.revoked));
  const [selectedKeyId, setSelectedKeyId] = useState(keys[0]?.id ?? '');
  const [window, setWindow] = useState<Window>('7d');

  const days = window === '7d' ? 7 : 30;
  const series = useMemo(
    () => (selectedKeyId ? buildSeries(selectedKeyId, days) : []),
    [selectedKeyId, days],
  );

  const totals = useMemo(() => {
    const calls = series.reduce((sum, point) => sum + point.calls, 0);
    const errors = series.reduce((sum, point) => sum + point.errors, 0);
    const latency =
      series.length > 0
        ? Math.round(series.reduce((sum, point) => sum + point.latency, 0) / series.length)
        : 0;
    return {
      calls,
      errorRate: calls > 0 ? Number(((errors / calls) * 100).toFixed(1)) : 0,
      latency,
    };
  }, [series]);

  const endpointRows = useMemo(() => {
    const endpoints = API_REGISTRY.flatMap((api) => parseSpec(api.spec));
    const random = seededRandom(selectedKeyId || 'default');
    return endpoints.slice(0, 8).map((endpoint) => ({
      endpoint: endpoint.path,
      method: endpoint.method.toUpperCase(),
      calls: Math.round(20 + random() * 200),
      errorRate: Number((random() * 10).toFixed(1)),
      latency: Math.round(70 + random() * 150),
    }));
  }, [selectedKeyId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Usage Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Per-key metrics over rolling 7-day and 30-day windows.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm ${window === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            onClick={() => setWindow('7d')}
          >
            7 days
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm ${window === '30d' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            onClick={() => setWindow('30d')}
          >
            30 days
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Call volume" value={totals.calls.toLocaleString()} />
        <MetricCard label="Error rate" value={`${totals.errorRate}%`} />
        <MetricCard label="Avg latency" value={`${totals.latency} ms`} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium" htmlFor="analytics-key">
            API key
          </label>
          <select
            id="analytics-key"
            value={selectedKeyId}
            onChange={(event) => setSelectedKeyId(event.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {keys.length === 0 ? <option value="">No active keys</option> : null}
            {keys.map((key) => (
              <option key={key.id} value={key.id}>
                {key.name}
              </option>
            ))}
          </select>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="calls" stroke="#2563eb" fill="#2563eb33" />
              <Area type="monotone" dataKey="errors" stroke="#dc2626" fill="#dc262633" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3">Endpoint</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Calls</th>
              <th className="px-4 py-3">Error rate</th>
              <th className="px-4 py-3">Avg latency</th>
            </tr>
          </thead>
          <tbody>
            {endpointRows.map((row) => (
              <tr key={`${row.method}-${row.endpoint}`} className="border-b border-border/70">
                <td className="px-4 py-3 font-mono">{row.endpoint}</td>
                <td className="px-4 py-3">{row.method}</td>
                <td className="px-4 py-3">{row.calls}</td>
                <td className="px-4 py-3">{row.errorRate}%</td>
                <td className="px-4 py-3">{row.latency} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
