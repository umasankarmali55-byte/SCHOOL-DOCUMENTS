import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Monitor,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onInstalled?: () => void;
  compact?: boolean;
}

export function PWAInstallButton({ onInstalled, compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, isEmbeddedFrame, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!showGuide) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuide(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showGuide]);

  // Automatically hide once running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        onInstalled?.();
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={
          isInstallable
            ? 'Install Govt. UGHS Malda as an offline desktop or mobile app'
            : 'View installation steps for Desktop, Android, or iOS'
        }
        className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
          isInstallable
            ? 'border-teal-600 bg-teal-700 text-white shadow-xs hover:bg-teal-800 dark:border-teal-500 dark:bg-teal-600 dark:hover:bg-teal-500'
            : 'border-teal-300 bg-teal-50/90 text-teal-900 hover:border-teal-400 hover:bg-teal-100/90 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-teal-900/70'
        }`}
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span className={compact ? 'hidden sm:inline' : ''}>Install App</span>
      </button>

      {showGuide && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-blue-200/90 bg-[#f8faff] shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#c89b3c] bg-gradient-to-r from-[#14254a] via-[#1c3468] to-[#1a3c78] px-5 py-4 text-white dark:border-b dark:border-slate-800 dark:bg-slate-950 dark:bg-none dark:text-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="Govt. UGHS Malda app icon"
                  className="h-10 w-10 shrink-0 rounded-lg border border-amber-300/60 bg-[#14254a]"
                />
                <div>
                  <h2
                    id="pwa-install-title"
                    className="font-display text-base font-bold text-white dark:text-slate-100"
                  >
                    Install UGHS Malda App
                  </h2>
                  <p className="text-xs text-blue-100/85 dark:text-slate-400">
                    Offline-ready desktop &amp; mobile PWA package
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close installation guide"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-blue-100 hover:bg-white/15 hover:text-white dark:text-slate-400 dark:hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 px-5 py-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Capabilities summary */}
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-[#162b5a] dark:text-slate-200">
                  <WifiOff className="h-3.5 w-3.5 shrink-0 text-teal-700 dark:text-teal-400" />
                  <span className="font-medium">Works fully offline</span>
                </div>
                <div className="flex items-center gap-2 text-[#162b5a] dark:text-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-700 dark:text-teal-400" />
                  <span className="font-medium">Standalone app window</span>
                </div>
              </div>

              {isEmbeddedFrame && (
                <div className="rounded-lg border border-amber-300/80 bg-amber-50/90 p-3.5 text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="font-semibold">Viewing inside a preview frame</p>
                  <p className="mt-1 leading-relaxed text-amber-900/90 dark:text-amber-300/90">
                    Browsers only allow one-click PWA installation from a top-level browser tab.
                    Open this studio in its own tab, then click <strong>Install App</strong>.
                  </p>
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1c3570] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#142754] dark:bg-sky-600 dark:hover:bg-sky-500"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Standalone Tab</span>
                  </a>
                </div>
              )}

              {isIOS ? (
                <div className="space-y-2 rounded-lg border border-blue-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 font-semibold text-[#162b5a] dark:text-slate-100">
                    <Smartphone className="h-4 w-4 text-[#1d4ed8] dark:text-sky-400" />
                    <span>Install on iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal space-y-1.5 pl-4 leading-relaxed">
                    <li>
                      Tap the{' '}
                      <span className="inline-flex items-center gap-1 font-semibold text-[#162b5a] dark:text-slate-100">
                        <Share className="h-3 w-3" /> Share
                      </span>{' '}
                      button in Safari&apos;s toolbar.
                    </li>
                    <li>
                      Scroll down and tap <strong>Add to Home Screen</strong>.
                    </li>
                    <li>
                      Tap <strong>Add</strong> in the top-right corner to launch it as an app.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5 rounded-lg border border-blue-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 font-semibold text-[#162b5a] dark:text-slate-100">
                      <Monitor className="h-4 w-4 text-[#1d4ed8] dark:text-sky-400" />
                      <span>Desktop (Chrome / Microsoft Edge)</span>
                    </div>
                    <p className="leading-relaxed">
                      Click the <strong>Install</strong> icon on the right side of the address bar,
                      or open the browser menu (<strong>⋮</strong>) and choose{' '}
                      <strong>Install Govt. UGHS Malda</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5 rounded-lg border border-blue-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 font-semibold text-[#162b5a] dark:text-slate-100">
                      <Smartphone className="h-4 w-4 text-teal-700 dark:text-teal-400" />
                      <span>Android &amp; iOS Mobile</span>
                    </div>
                    <p className="leading-relaxed">
                      On Android Chrome, tap menu (<strong>⋮</strong>) →{' '}
                      <strong>Install app</strong>. On iPhone/iPad Safari, tap{' '}
                      <strong>Share</strong> → <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-blue-200/80 bg-[#edf3fc] px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#1c3570] px-4 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#142754] dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
