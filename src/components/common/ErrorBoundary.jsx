import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sentinel ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070a] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            Feed o componente temporaneamente non disponibile
          </h2>
          <p className="text-xs text-white/60 max-w-sm mb-6">
            Si è verificato un problema di caricamento o di connessione. Puoi riprovare ad aggiornare la pagina o tornare alla navigazione.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={this.handleRetry}
              className="bg-[#10b981] hover:bg-emerald-400 text-black font-bold text-xs px-5 py-2.5 rounded-full flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Riprova
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/Home';
              }}
              className="border-white/15 text-white hover:bg-white/10 text-xs px-4 py-2.5 rounded-full"
            >
              Torna alla Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
