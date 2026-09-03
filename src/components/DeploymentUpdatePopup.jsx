import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { BUILD_VERSION, BUILD_TIME } from '../config/buildVersion';

const STORAGE_KEY = 'hc_acknowledged_build_version';

function DeploymentUpdatePopup() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!BUILD_VERSION || BUILD_VERSION === '__BUILD_VERSION__') return;

        const acknowledgedVersion = localStorage.getItem(STORAGE_KEY);

        if (acknowledgedVersion !== BUILD_VERSION) {
            setShow(true);
        }
    }, []);

    const acknowledge = () => {
        localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
        setShow(false);
    };

    const reloadApplication = () => {
        localStorage.setItem(STORAGE_KEY, BUILD_VERSION);
        window.location.reload();
    };

    if (!show) return null;

    const formattedTime = BUILD_TIME !== '__BUILD_TIME__'
        ? new Date(BUILD_TIME).toLocaleString()
        : '';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-cyan-400/20 bg-slate-900/95 shadow-2xl shadow-cyan-950/40">
                <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                                <Sparkles size={22} />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    HealthChain Updated
                                </h2>
                                <p className="text-sm text-slate-400">
                                    A new version is available.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={acknowledge}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                            aria-label="Close update notification"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <p className="text-sm leading-6 text-slate-300">
                            HealthChain has been updated with the latest improvements
                            and fixes. Refresh the application to use the newest version.
                        </p>

                        {formattedTime && (
                            <p className="mt-2 text-xs text-slate-500">
                                Deployed: {formattedTime}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={acknowledge}
                            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                        >
                            Later
                        </button>

                        <button
                            type="button"
                            onClick={reloadApplication}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                            <RefreshCw size={17} />
                            Refresh Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeploymentUpdatePopup;
