import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[300px] flex items-center justify-center p-6 bg-[#0B0F1A]/90 border border-red-500/20 rounded-3xl backdrop-blur-xl relative overflow-hidden my-4">
                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-red-500/5 rounded-full blur-[60px] pointer-events-none" />
                    
                    <div className="text-center max-w-md relative z-10 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold font-display text-white">
                                Module Load Error
                            </h3>
                            <p className="text-xs text-[#8899AA] leading-relaxed">
                                Something went wrong while rendering this component. This may be due to incomplete data sync or offline latency.
                            </p>
                        </div>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/25 hover:bg-red-500/35 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-500/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Module
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
