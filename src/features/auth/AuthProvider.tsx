import { SignJWT, jwtVerify } from 'jose';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext, type AuthContextValue, type AuthUser } from './auth-context';

const AUTH_STORAGE_KEY = 'developer-portal-auth-v1';
const USERS_STORAGE_KEY = 'developer-portal-users-v1';
const TOKEN_EXPIRY = '15m';
const REFRESH_BUFFER_MS = 60_000;

interface StoredAuth {
  token: string;
  user: AuthUser;
}

interface StoredUser extends AuthUser {
  password: string;
}

function getSecretKey(): Uint8Array {
  const secret = import.meta.env.VITE_JWT_SECRET || 'dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey());
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.name !== 'string') {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);

  const persistAuth = useCallback((next: StoredAuth | null) => {
    if (next) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      setUser(next.user);
      setToken(next.token);
      return;
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const scheduleRefresh = useCallback(
    (currentToken: string, currentUser: AuthUser) => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      void jwtVerify(currentToken, getSecretKey())
        .then(({ payload }) => {
          const exp = payload.exp;
          if (!exp) {
            return;
          }
          const refreshAt = exp * 1000 - Date.now() - REFRESH_BUFFER_MS;
          refreshTimerRef.current = window.setTimeout(() => {
            void createToken(currentUser).then((nextToken) => {
              persistAuth({ token: nextToken, user: currentUser });
              scheduleRefresh(nextToken, currentUser);
            });
          }, Math.max(refreshAt, 0));
        })
        .catch(() => {
          persistAuth(null);
        });
    },
    [persistAuth],
  );

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const stored = JSON.parse(raw) as StoredAuth;
        const verifiedUser = await verifyToken(stored.token);
        if (!verifiedUser) {
          persistAuth(null);
          setIsLoading(false);
          return;
        }
        persistAuth({ token: stored.token, user: verifiedUser });
        scheduleRefresh(stored.token, verifiedUser);
      } catch {
        persistAuth(null);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [persistAuth, scheduleRefresh]);

  const signUp = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const users = readUsers();
      const normalizedEmail = email.trim().toLowerCase();

      if (users.some((entry) => entry.email === normalizedEmail)) {
        throw new Error('An account with this email already exists.');
      }

      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        password,
      };

      writeUsers([...users, newUser]);
      const nextToken = await createToken(newUser);
      persistAuth({ token: nextToken, user: newUser });
      scheduleRefresh(nextToken, newUser);
    },
    [persistAuth, scheduleRefresh],
  );

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const users = readUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const matched = users.find(
        (entry) => entry.email === normalizedEmail && entry.password === password,
      );

      if (!matched) {
        throw new Error('Invalid email or password.');
      }

      const authUser: AuthUser = {
        id: matched.id,
        email: matched.email,
        name: matched.name,
      };
      const nextToken = await createToken(authUser);
      persistAuth({ token: nextToken, user: authUser });
      scheduleRefresh(nextToken, authUser);
    },
    [persistAuth, scheduleRefresh],
  );

  const signOut = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    persistAuth(null);
  }, [persistAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      signUp,
      signIn,
      signOut,
    }),
    [user, token, isLoading, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
