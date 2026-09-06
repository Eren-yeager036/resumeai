import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('pending_imported_resume');
    const activeKeys = Object.keys(localStorage).filter(k => k.startsWith('resumeData_'));
    activeKeys.forEach(k => localStorage.removeItem(k));
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Workspace Load Exception</h2>
              <p className="text-xs text-slate-400 mt-2">
                A state initialization error occurred. Click below to recover workspace defaults.
              </p>
              {this.state.error && (
                <div className="mt-3 p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-rose-300 border border-slate-800 break-all text-left">
                  {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
                </div>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <RefreshCw size={16} /> Reset & Restore Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
