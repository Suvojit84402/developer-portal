import { getActiveIncidents } from '@/features/status/status-data';

export function IncidentBanner() {
  const incidents = getActiveIncidents();

  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
      <strong className="font-semibold">Active incident:</strong>{' '}
      {incidents.map((incident) => incident.title).join(' · ')}
    </div>
  );
}
