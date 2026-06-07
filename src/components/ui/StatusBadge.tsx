import { getStatusColorClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold',
        getStatusColorClass(status),
        className,
      )}
    >
      {status}
    </span>
  );
}
