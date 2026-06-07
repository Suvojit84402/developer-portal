import { getHealthColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface HealthBadgeProps {
  status: 'operational' | 'degraded' | 'outage';
}

export function HealthBadge({ status }: HealthBadgeProps) {
  const label =
    status === 'operational' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Outage';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        getHealthColor(status),
      )}
    >
      {label}
    </span>
  );
}
