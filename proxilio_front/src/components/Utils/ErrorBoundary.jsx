import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Crash:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 max-w-2xl mx-auto mt-10">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-medium text-red-700">Une erreur inattendue s'est produite</h2>
            <p className="text-sm text-red-600 font-light">
              {this.state.error?.message || String(this.state.error)}
            </p>
            <pre className="text-[11px] text-red-500 font-mono bg-red-100 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ error: null })}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-light text-white hover:bg-red-700 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
