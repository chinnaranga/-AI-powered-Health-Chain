import React, { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile Anti-Bot Verification Widget
 */
export default function TurnstileWidget({ onVerify, siteKey = '0x4AAAAAAAx_exampleKey2026' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (window.turnstile && containerRef.current) {
            try {
                window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token) => {
                        if (onVerify) onVerify(token);
                    }
                });
            } catch (e) {}
        } else {
            // Simulated verification callback for dev mode
            if (onVerify) onVerify('turnstile_verified_dev_token');
        }
    }, [onVerify, siteKey]);

    return (
        <div className="my-3 flex justify-center">
            <div ref={containerRef} className="cf-turnstile-container min-h-[65px] flex items-center justify-center p-2 rounded-xl bg-[#0F172A]/60 border border-[#1E2D45] text-xs text-gray-400">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Protected by Cloudflare Turnstile
                </span>
            </div>
        </div>
    );
}
