import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render(): ReactNode {
    if (this.state.error) {
      const error = this.state.error;
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div
            role="alert"
            className="w-full max-w-lg rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center"
          >
            <h1 className="text-xl font-semibold text-destructive">Something went wrong</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {error.message || 'An unexpected error occurred while rendering this page.'}
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
