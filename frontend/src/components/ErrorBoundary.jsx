import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isOnline: navigator.onLine,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to external service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ isOnline: true });
  };

  handleOffline = () => {
    this.setState({ isOnline: false });
  };

  logErrorToService = async (error, errorInfo) => {
    try {
      // In a real app, you would send this to an error tracking service
      // like Sentry, LogRocket, or Bugsnag
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId')
      };

      // Example: Send to your backend error logging endpoint
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
      
      console.log('Error logged:', errorData);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  getErrorType = () => {
    const { error } = this.state;
    if (!error) return 'unknown';

    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'chunk';
    }
    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      return 'network';
    }
    if (error.message.includes('TypeError') && error.message.includes('undefined')) {
      return 'undefined';
    }
    if (error.message.includes('ReferenceError')) {
      return 'reference';
    }
    return 'unknown';
  };

  getErrorTitle = (errorType) => {
    const titles = {
      chunk: 'Update Available',
      network: 'Connection Issue',
      undefined: 'Data Error',
      reference: 'Code Error',
      unknown: 'Something Went Wrong'
    };
    return titles[errorType] || titles.unknown;
  };

  getErrorDescription = (errorType) => {
    const descriptions = {
      chunk: 'A new version of StudyBrain is available. Please refresh to get the latest features.',
      network: 'There seems to be a connection issue. Please check your internet connection.',
      undefined: 'Some data is missing or corrupted. Try refreshing the page.',
      reference: 'There\'s a technical issue. Our team has been notified.',
      unknown: 'An unexpected error occurred. Please try again or contact support.'
    };
    return descriptions[errorType] || descriptions.unknown;
  };

  getErrorIcon = (errorType) => {
    const icons = {
      chunk: RefreshCw,
      network: this.state.isOnline ? Wifi : WifiOff,
      undefined: AlertTriangle,
      reference: Bug,
      unknown: AlertTriangle
    };
    return icons[errorType] || AlertTriangle;
  };

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType();
      const title = this.getErrorTitle(errorType);
      const description = this.getErrorDescription(errorType);
      const Icon = this.getErrorIcon(errorType);

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            {/* Error Icon */}
            <motion.div
              animate={{ 
                rotate: errorType === 'chunk' ? 360 : 0,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: errorType === 'chunk' ? Infinity : 0 },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <Icon className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Error Content */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
              <p className="text-gray-300 text-lg mb-6">{description}</p>
              
              {/* Connection Status */}
              {errorType === 'network' && (
                <div className={`inline-flex items-center px-4 py-2 rounded-lg mb-6 ${
                  this.state.isOnline 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <Wifi className="w-4 h-4 mr-2" />
                  {this.state.isOnline ? 'Connected' : 'Offline'}
                </div>
              )}

              {/* Retry Count */}
              {this.state.retryCount > 0 && (
                <div className="text-sm text-gray-400 mb-4">
                  Retry attempt: {this.state.retryCount}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {errorType === 'chunk' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.handleReload}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Update Now</span>
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleRetry}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={this.handleReload}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Reload Page</span>
                  </motion.button>
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleGoHome}
                className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </motion.button>
            </div>

            {/* Debug Info (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 p-4 bg-slate-900/50 rounded-lg">
                <summary className="text-gray-400 cursor-pointer mb-4">
                  Debug Information (Development Only)
                </summary>
                <div className="space-y-4">
                  <div>
                    <strong className="text-red-400">Error:</strong>
                    <pre className="text-sm text-gray-300 mt-1 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  <div>
                    <strong className="text-red-400">Stack Trace:</strong>
                    <pre className="text-sm text-gray-300 mt-1 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  <div>
                    <strong className="text-red-400">Component Stack:</strong>
                    <pre className="text-sm text-gray-300 mt-1 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                If this problem persists, please{' '}
                <a 
                  href="mailto:support@studybrain.com" 
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  contact support
                </a>
                {' '}with the error details above.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;