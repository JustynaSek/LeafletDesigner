'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    console.error('[ErrorBoundary] getDerivedStateFromError:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] componentDidCatch:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <p>An unexpected error occurred. Please try refreshing the page.</p>
          {this.state.error && (
            <pre className="mt-4 p-2 bg-gray-800 text-left text-sm text-red-400 rounded-md overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
           <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 