import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useApiKeyStore } from '@/lib/stores';
import { copyToClipboard, formatDate, maskApiKey } from '@/lib/utils';
import { createKeySchema } from '@/lib/validation';
import { useState } from 'react';

export function KeysPage() {
  const keys = useApiKeyStore((state) => state.keys);
  const createKey = useApiKeyStore((state) => state.createKey);
  const revokeKey = useApiKeyStore((state) => state.revokeKey);

  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [expiresAt, setExpiresAt] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const parsed = createKeySchema.safeParse({ name, environment, expiresAt });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid form input.');
      return;
    }

    const key = createKey({
      name: parsed.data.name,
      environment: parsed.data.environment,
      expiresAt: parsed.data.expiresAt || undefined,
    });
    setCreatedKey(key.fullKey ?? null);
    setName('');
    setExpiresAt('');
  }

  async function handleCopy() {
    if (!createdKey) {
      return;
    }
    await copyToClipboard(createdKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const activeKeys = keys.filter((key) => !key.revoked);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create and manage API keys for sandbox and production environments.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <Input label="Key name" value={name} onChange={(event) => setName(event.target.value)} required />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Environment</label>
          <select
            value={environment}
            onChange={(event) =>
              setEnvironment(event.target.value as 'sandbox' | 'production')
            }
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </div>
        <Input
          label="Expiry date (optional)"
          type="date"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Create key
          </Button>
        </div>
      </form>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {createdKey ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-700 dark:bg-amber-950/20">
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            Copy your API key now. It will not be shown again.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded bg-background px-3 py-2 text-sm">{createdKey}</code>
            <Button size="sm" onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy key'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCreatedKey(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}

      {activeKeys.length === 0 ? (
        <EmptyState
          title="No API keys yet"
          description="Create your first key to authenticate sandbox and production requests."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Environment</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Last used</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeKeys.map((key) => (
                <tr key={key.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{key.name}</td>
                  <td className="px-4 py-3 font-mono">
                    {maskApiKey(`${key.prefix}${'x'.repeat(24)}${key.lastFour}`)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{key.environment}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRevokeTarget(key.id)}
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {revokeTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Revoke API key?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone. Requests using this key will fail immediately.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRevokeTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  revokeKey(revokeTarget);
                  setRevokeTarget(null);
                }}
              >
                Revoke key
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
