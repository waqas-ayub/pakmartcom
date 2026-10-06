import { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export function ErrorFallback({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          PakMart hit an unexpected problem. Please reload the page — if it keeps happening, try again in a few minutes.
        </p>
        {message && <p className="text-xs text-muted-foreground/70 break-words">{message}</p>}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
          >
            Reload page
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 rounded-md border text-sm font-semibold"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[PakMart] Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) return <ErrorFallback message={this.state.error.message} />;
    return this.props.children;
  }
}
