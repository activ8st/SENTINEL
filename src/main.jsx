import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Sentinel App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
          <img src="/logo.svg" alt="Sentinel Logo" className="w-16 h-16 rounded-2xl mb-4" />
          <h2 className="text-xl font-bold mb-2">Network Sentinel in Riconnessione</h2>
          <p className="text-xs text-white/50 max-w-sm mb-6">
            Si è verificato un ripristino temporaneo dell'interfaccia. Clicca il pulsante qui sotto per ricaricare.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#10b981] hover:bg-[#10b981]/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/30"
          >
            Ricarica Applicazione
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
