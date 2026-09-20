import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className={
          minimal
            ? 'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition active:scale-95 shadow-sm'
            : 'flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition'
        }
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className={
            minimal
              ? 'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-amber-400 border border-amber-500/40 hover:bg-slate-700 transition'
              : 'flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-amber-400 hover:bg-slate-800 active:scale-95 transition'
          }
        >
          <Smartphone className="w-4 h-4" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-slate-100">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    1
                  </div>
                  <p>
                    Tap the <Share2 className="inline w-4 h-4 text-blue-400 mx-1" /> <strong>Share</strong> button in the Safari bottom bar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    2
                  </div>
                  <p>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-400">
                    3
                  </div>
                  <p>Launch the app directly from your home screen with zero browser bars!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
