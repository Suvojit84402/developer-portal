import { getMethodColorClass } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-w-16 items-center justify-center rounded px-2 py-0.5 text-xs font-semibold uppercase',
        getMethodColorClass(method),
        className,
      )}
    >
      {method}
    </span>
  );
}
