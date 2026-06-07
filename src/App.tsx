import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { ChangelogPage } from '@/features/changelog/ChangelogPage';
import { DocsPage } from '@/features/docs/DocsPage';
import { KeysPage } from '@/features/keys/KeysPage';
import { SandboxPage } from '@/features/sandbox/SandboxPage';
import { RequestHistoryPanel } from '@/features/sandbox/RequestHistoryPanel';
import { StatusPage } from '@/features/status/StatusPage';
import { API_REGISTRY } from '@/apis/api-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();
const defaultApiId = API_REGISTRY[0]?.id ?? 'pokeapi';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={`/docs/${defaultApiId}`} replace />} />
        <Route path="/docs" element={<Navigate to={`/docs/${defaultApiId}`} replace />} />
        <Route path="/docs/:apiId" element={<DocsPage />} />
        <Route path="/docs/:apiId/:operationId" element={<DocsPage />} />
        <Route path="/sandbox/:apiId/:operationId" element={<SandboxPage />} />
        <Route
          path="/keys"
          element={
            <AuthGuard>
              <KeysPage />
            </AuthGuard>
          }
        />
        <Route
          path="/analytics"
          element={
            <AuthGuard>
              <AnalyticsPage />
            </AuthGuard>
          }
        />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route
          path="/history"
          element={
            <AuthGuard>
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">Request History</h1>
                <RequestHistoryPanel />
              </div>
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to={`/docs/${defaultApiId}`} replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
