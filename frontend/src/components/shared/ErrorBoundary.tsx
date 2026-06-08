import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro nao tratado na interface', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="nexus-panel max-w-lg space-y-4 text-center">
            <h1 className="text-xl font-extrabold uppercase text-slate-900">Nao foi possivel exibir esta tela</h1>
            <p className="text-sm text-slate-600">Recarregue a pagina para tentar novamente.</p>
            <button type="button" className="nexus-primary-button w-full" onClick={() => window.location.reload()}>
              Recarregar pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
