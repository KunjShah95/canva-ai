import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled application error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoDashboard = () => {
        window.location.assign('/dashboard');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white dark:bg-black text-ink dark:text-white flex items-center justify-center px-6">
                    <div className="w-full max-w-xl rounded-3xl border border-gray-100 dark:border-white/10 bg-white/90 dark:bg-[#0A0A0A] p-10 shadow-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7">
                                <path d="M12 9v4m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.53 20h14.94a2 2 0 001.74-3l-7.5-13a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 mb-3">Editor Recovery Mode</p>
                        <h1 className="text-3xl font-serif mb-4">Something went sideways.</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-6 mb-8">
                            The app hit an unexpected error. Try reloading, or jump back to the dashboard and reopen your project.
                        </p>

                        {this.state.error?.message && (
                            <div className="mb-8 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-xs text-gray-500 dark:text-gray-300 break-words">
                                {this.state.error.message}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 py-3 rounded-xl bg-brand text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-brand-dark transition-all"
                            >
                                Reload App
                            </button>
                            <button
                                onClick={this.handleGoDashboard}
                                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;