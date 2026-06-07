export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function maskApiKey(key: string): string {
  if (key.length <= 4) {
    return '****';
  }
  return `${'*'.repeat(Math.max(key.length - 4, 8))}${key.slice(-4)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function getStatusColorClass(status: number): string {
  if (status >= 200 && status < 300) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  }
  if (status >= 300 && status < 400) {
    return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300';
  }
  if (status >= 400 && status < 500) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  }
  if (status >= 500) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  }
  return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
}

export function getMethodColorClass(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'POST':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'PUT':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'PATCH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'DELETE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
  }
}

export function getChangelogTypeColor(type: string): string {
  switch (type) {
    case 'Breaking':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Feature':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'Fix':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
  }
}

export function getHealthColor(status: string): string {
  switch (status) {
    case 'operational':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'degraded':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'outage':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
  }
}
