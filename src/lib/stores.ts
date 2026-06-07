import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Environment = 'sandbox' | 'staging' | 'production';

interface EnvironmentState {
  environment: Environment;
  setEnvironment: (environment: Environment) => void;
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set) => ({
      environment: 'sandbox',
      setEnvironment: (environment) => set({ environment }),
    }),
    { name: 'developer-portal-environment' },
  ),
);

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'developer-portal-theme' },
  ),
);

export interface RequestHistoryEntry {
  id: string;
  timestamp: string;
  apiId?: string;
  operationId?: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  status?: number;
  latencyMs?: number;
  responseBody?: string;
}

interface RequestHistoryState {
  entries: RequestHistoryEntry[];
  addEntry: (entry: RequestHistoryEntry) => void;
  clearEntries: () => void;
}

export const useRequestHistoryStore = create<RequestHistoryState>()((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries].slice(0, 50),
    })),
  clearEntries: () => set({ entries: [] }),
}));

export type ApiKeyEnvironment = 'sandbox' | 'production';

export interface ApiKey {
  id: string;
  name: string;
  environment: ApiKeyEnvironment;
  prefix: string;
  lastFour: string;
  fullKey?: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  revoked: boolean;
}

interface ApiKeyState {
  keys: ApiKey[];
  createKey: (input: {
    name: string;
    environment: ApiKeyEnvironment;
    expiresAt?: string;
  }) => ApiKey;
  revokeKey: (id: string) => void;
  markKeyUsed: (id: string) => void;
}

function generateKeyValue(environment: ApiKeyEnvironment): string {
  const prefix = environment === 'sandbox' ? 'sk_sandbox_' : 'sk_live_';
  const randomPart = crypto.randomUUID().replace(/-/g, '');
  return `${prefix}${randomPart}`;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      keys: [],
      createKey: ({ name, environment, expiresAt }) => {
        const fullKey = generateKeyValue(environment);
        const key: ApiKey = {
          id: crypto.randomUUID(),
          name,
          environment,
          prefix: fullKey.slice(0, fullKey.indexOf('_', 3) + 1),
          lastFour: fullKey.slice(-4),
          fullKey,
          createdAt: new Date().toISOString(),
          expiresAt,
          revoked: false,
        };

        set((state) => ({ keys: [key, ...state.keys] }));
        return key;
      },
      revokeKey: (id) =>
        set((state) => ({
          keys: state.keys.map((key) =>
            key.id === id ? { ...key, revoked: true, fullKey: undefined } : key,
          ),
        })),
      markKeyUsed: (id) => {
        const keys = get().keys;
        if (!keys.some((key) => key.id === id)) {
          return;
        }
        set({
          keys: keys.map((key) =>
            key.id === id ? { ...key, lastUsedAt: new Date().toISOString() } : key,
          ),
        });
      },
    }),
    { name: 'developer-portal-api-keys' },
  ),
);
