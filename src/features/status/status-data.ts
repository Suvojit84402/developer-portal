import type { ApiHealthStatus, Incident } from '@/apis/types';

export const API_STATUS: Record<
  string,
  { status: ApiHealthStatus; uptimePercent: number }
> = {
  pokeapi: { status: 'operational', uptimePercent: 99.98 },
  'stub-payments': { status: 'degraded', uptimePercent: 98.42 },
};

export const INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    apiId: 'stub-payments',
    title: 'Elevated latency on payment creation',
    status: 'degraded',
    startedAt: '2026-06-05T09:15:00Z',
    description: 'Payment creation requests are experiencing elevated latency in the sandbox environment.',
    resolution: 'Engineering has identified a database connection pool issue and is rolling out a fix.',
  },
  {
    id: 'inc-002',
    apiId: 'pokeapi',
    title: 'Scheduled maintenance completed',
    status: 'operational',
    startedAt: '2026-05-20T02:00:00Z',
    resolvedAt: '2026-05-20T03:30:00Z',
    description: 'Routine database maintenance caused brief read-only mode.',
    resolution: 'Maintenance completed successfully with no data loss.',
  },
  {
    id: 'inc-003',
    apiId: 'stub-payments',
    title: 'Webhook delivery delays',
    status: 'operational',
    startedAt: '2026-04-12T14:00:00Z',
    resolvedAt: '2026-04-12T16:45:00Z',
    description: 'Webhook delivery queue backlog caused delayed event notifications.',
    resolution: 'Queue processing scaled horizontally and backlog cleared.',
  },
];

export function getActiveIncidents(): Incident[] {
  return INCIDENTS.filter((incident) => !incident.resolvedAt);
}

export function hasDegradedApis(): boolean {
  return Object.values(API_STATUS).some((status) => status.status !== 'operational');
}
