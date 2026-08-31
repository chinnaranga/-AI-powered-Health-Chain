import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PinGate({ onUnlock }) {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState(false);

    // Simple hardcoded PIN for demonstration
    const CORRECT_PIN = '1234';

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto-focus next
        if (value && index < 3) {
            document.getElementById(`pin-${index + 1}`).focus();
        }

        // Check PIN when all digits entered
        if (newPin.every(d => d !== '')) {
            if (newPin.join('') === CORRECT_PIN) {
                onUnlock();
            } else {
                setError(true);
                setTimeout(() => {
                    setPin(['', '', '', '']);
                    setError(false);
                    document.getElementById('pin-0').focus();
                }, 1000);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            document.getElementById(`pin-${index - 1}`).focus();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-soft"
            >
                <div className="w-16 h-16 bg-sage-50 text-sage rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8" />
                </div>
                
                <h2 className="text-xl font-display font-bold text-navy mb-2">Patient Authentication</h2>
                <p className="text-sm text-slate-500 mb-8">Enter your security PIN to decrypt and access your medical records.</p>
                
                <div className="flex justify-center gap-4 mb-4">
                    {pin.map((digit, i) => (
                        <input
                            key={i}
                            id={`pin-${i}`}
                            type="password"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className={`w-14 h-16 text-center text-2xl font-display font-bold rounded-xl border-2 outline-none transition-all ${
                                error ? 'border-error bg-error/5 text-error' 
                                : digit ? 'border-sage border-b-4 bg-sage-50' 
                                : 'border-slate-200 bg-slate-50 focus:border-sage-400'
                            }`}
                        />
                    ))}
                </div>
                
                <div className="h-6">
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-error text-sm font-medium"
                        >
                            Incorrect PIN. Please try again.
                        </motion.p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
