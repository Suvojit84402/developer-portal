import { API_REGISTRY } from '@/apis/api-registry';
import { Button } from '@/components/ui/Button';
import { SearchModal } from '@/components/ui/SearchModal';
import { IncidentBanner } from '@/components/layout/IncidentBanner';
import { useAuth } from '@/features/auth/useAuth';
import { useEnvironmentStore, useThemeStore } from '@/lib/stores';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';

const navItems = [
  { to: '/docs', label: 'Documentation' },
  { to: '/keys', label: 'API Keys', protected: true },
  { to: '/analytics', label: 'Analytics', protected: true },
  { to: '/status', label: 'Status' },
  { to: '/changelog', label: 'Changelog' },
  { to: '/history', label: 'Request History', protected: true },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { apiId } = useParams();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { environment, setEnvironment } = useEnvironmentStore();
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    root.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <IncidentBanner />
      <div className="flex min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 shrink-0 overflow-y-auto border-r border-border bg-sidebar p-4 transition-transform lg:static lg:z-auto lg:block lg:translate-x-0',
            sidebarOpen ? 'block translate-x-0' : 'hidden -translate-x-full lg:block',
          )}
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Link
              to="/docs"
              className="text-lg font-semibold"
              onClick={() => setSidebarOpen(false)}
            >
              {import.meta.env.VITE_APP_NAME || 'Developer Portal'}
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              Close
            </Button>
          </div>
          <Link to="/docs" className="hidden text-lg font-semibold lg:inline">
            {import.meta.env.VITE_APP_NAME || 'Developer Portal'}
          </Link>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) =>
              item.protected && !user ? null : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted',
                      isActive && 'bg-muted text-primary',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>
          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              APIs
            </p>
            <div className="space-y-1">
              {API_REGISTRY.map((api) => (
                <NavLink
                  key={api.id}
                  to={`/docs/${api.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2 text-sm hover:bg-muted',
                      (isActive || apiId === api.id) && 'bg-muted text-primary',
                    )
                  }
                >
                  {api.name}
                </NavLink>
              ))}
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                Menu
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSearchOpen(true)}>
                Search <span className="ml-2 text-xs text-muted-foreground">Ctrl+K</span>
              </Button>
              <select
                value={environment}
                onChange={(event) =>
                  setEnvironment(event.target.value as 'sandbox' | 'staging' | 'production')
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                aria-label="Environment"
              >
                <option value="sandbox">Sandbox</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')
                }
              >
                Theme
              </Button>
              {user ? (
                <>
                  <span className="hidden text-sm text-muted-foreground sm:inline">
                    {user.name}
                  </span>
                  <Button variant="secondary" size="sm" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Link to="/login">
                  <Button size="sm">Sign in</Button>
                </Link>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
