/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Bell, Copy } from 'lucide-react';

export const OtpBanner: React.FC = () => {
  const { otpToast, clearOtpToast } = useApp();

  if (!otpToast) return null;

  const codeMatch = otpToast.match(/\d{6}/);
  const code = codeMatch ? codeMatch[0] : '';

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      alert('Code OTP copié : ' + code);
    }
  };

  return (
    <div id="otp-floating-banner" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-white border border-emerald-100 rounded-2xl shadow-2xl p-4 animate-bounce">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-sans font-semibold text-sm text-slate-800">
              Simulation Réseau AgriAfri SMS
            </h4>
            <button 
              id="otp-close-btn"
              onClick={clearOtpToast} 
              className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-xs text-emerald-600 mt-1">
            Reçu à l'instant (Validation obligatoire)
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2 flex justify-between items-center gap-2">
            <span className="font-mono text-sm font-semibold select-all text-slate-700">
              {otpToast}
            </span>
            {code && (
              <button
                id="otp-copy-btn"
                onClick={copyToClipboard}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-xs shrink-0 transition-all font-sans"
              >
                <Copy className="w-3.5 h-3.5" />
                Copier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
