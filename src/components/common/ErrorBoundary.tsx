'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo; errorId: string; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor (props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError (error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
    // Log detailed error information to console
    console.group(`🚨 Client-Side Error (${this.state.errorId})`);
    console.error('Error:', error);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Info:', errorInfo);

    // Log additional context
    console.log('URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Session Storage:', Object.keys(sessionStorage));
    console.log('Local Storage:', Object.keys(localStorage));

    // Check for common issues
    this.diagnoseCommonIssues(error, errorInfo);

    console.groupEnd();

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Send error to analytics or monitoring service (if configured)
    this.reportError(error, errorInfo);
  }

  private diagnoseCommonIssues (error: Error, errorInfo: React.ErrorInfo) {
    console.group('🔍 Common Issue Diagnosis');

    // Check for hydration errors
    if (error.message.includes('hydration') || error.message.includes('Hydration')) {
      console.warn('⚠️  Potential hydration mismatch detected');
      console.log('This often happens when server and client render different content');
    }

    // Check for authentication issues
    if (error.message.includes('auth') || error.message.includes('session')) {
      console.warn('⚠️  Potential authentication/session issue detected');
    }

    // Check for API errors
    if (error.message.includes('fetch') || error.message.includes('API')) {
      console.warn('⚠️  Potential API/network issue detected');
    }

    // Check for component rendering issues
    if (errorInfo.componentStack?.includes('render') || error.message.includes('render')) {
      console.warn('⚠️  Potential component rendering issue detected');
    }

    // Check for state management issues
    if (error.message.includes('state') || error.message.includes('useState')) {
      console.warn('⚠️  Potential state management issue detected');
    }

    console.groupEnd();
  }

  private reportError (error: Error, errorInfo: React.ErrorInfo) {
    // You can integrate with error reporting services here
    // Example: Sentry, LogRocket, etc.

    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Error Report:', errorReport);
    }

    // You can send this to your error tracking service
    // Example: fetch('/api/error-reporting', { method: 'POST', body: JSON.stringify(errorReport) });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  render () {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;

        return (
          <FallbackComponent
            error={this.state.error!}
            errorInfo={this.state.errorInfo!}
            errorId={this.state.errorId}
            resetError={this.resetError}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We encountered an unexpected error. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Error ID: {this.state.errorId}</span>
                </div>
                <p className="text-sm text-gray-600">
                  Please include this error ID when contacting support.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-50 p-4 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-red-700 space-y-2">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.resetError}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
