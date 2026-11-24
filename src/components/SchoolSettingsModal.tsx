import { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { DEFAULT_SCHOOL_CONFIG, SchoolConfig } from '../types/documents';

interface SchoolSettingsModalProps {
  open: boolean;
  config: SchoolConfig;
  onChange: (next: SchoolConfig) => void;
  onClose: () => void;
}

const INPUT_CLASS =
  'h-10 w-full rounded-lg border border-blue-200/90 bg-white px-3 text-sm text-slate-900 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-0';

const LABEL_CLASS =
  'mb-1.5 block text-xs font-medium text-[#3b4f74] dark:text-slate-400';

export function SchoolSettingsModal({
  open,
  config,
  onChange,
  onClose,
}: SchoolSettingsModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const patch = (partial: Partial<SchoolConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-blue-200/90 bg-[#f8faff] shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b-2 border-[#c89b3c] bg-gradient-to-r from-[#14254a] via-[#1c3468] to-[#1a3c78] px-5 py-4 text-white dark:border-b dark:border-slate-800 dark:bg-slate-950 dark:bg-none dark:text-slate-100">
          <div>
            <h2
              id="school-settings-title"
              className="font-display text-base font-bold text-white dark:text-slate-100"
            >
              School Letterhead &amp; Codes
            </h2>
            <p className="mt-0.5 text-xs text-blue-100/85 dark:text-slate-400">
              Updates apply immediately across all certificates and mark sheets.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close school header settings"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-blue-100 hover:bg-white/15 hover:text-white dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor="cfg-office" className={LABEL_CLASS}>
              Office title (Line 1)
            </label>
            <input
              id="cfg-office"
              type="text"
              value={config.officeTitle}
              onChange={(e) => patch({ officeTitle: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="cfg-school" className={LABEL_CLASS}>
              Institution name (Line 2)
            </label>
            <input
              id="cfg-school"
              type="text"
              value={config.schoolName}
              onChange={(e) => patch({ schoolName: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="cfg-address" className={LABEL_CLASS}>
              Address line (Line 3)
            </label>
            <input
              id="cfg-address"
              type="text"
              value={config.addressLine}
              onChange={(e) => patch({ addressLine: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="cfg-email" className={LABEL_CLASS}>
                Official Email ID
              </label>
              <input
                id="cfg-email"
                type="email"
                value={config.email}
                onChange={(e) => patch({ email: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="cfg-bse" className={LABEL_CLASS}>
                BSE Code
              </label>
              <input
                id="cfg-bse"
                type="text"
                value={config.bseCode}
                onChange={(e) => patch({ bseCode: e.target.value })}
                className={`${INPUT_CLASS} font-mono-tabular`}
              />
            </div>
            <div>
              <label htmlFor="cfg-udise" className={LABEL_CLASS}>
                UDISE Code
              </label>
              <input
                id="cfg-udise"
                type="text"
                value={config.udiseCode}
                onChange={(e) => patch({ udiseCode: e.target.value })}
                className={`${INPUT_CLASS} font-mono-tabular`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cfg-body-school" className={LABEL_CLASS}>
                School name in certificate body
              </label>
              <input
                id="cfg-body-school"
                type="text"
                value={config.bodySchoolName}
                onChange={(e) => patch({ bodySchoolName: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="cfg-place" className={LABEL_CLASS}>
                Place label (footer)
              </label>
              <input
                id="cfg-place"
                type="text"
                value={config.placeLabel}
                onChange={(e) => patch({ placeLabel: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cfg-wm-top" className={LABEL_CLASS}>
                Seal watermark top arc
              </label>
              <input
                id="cfg-wm-top"
                type="text"
                value={config.watermarkTop}
                onChange={(e) => patch({ watermarkTop: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="cfg-wm-bot" className={LABEL_CLASS}>
                Seal watermark bottom arc
              </label>
              <input
                id="cfg-wm-bot"
                type="text"
                value={config.watermarkBottom}
                onChange={(e) => patch({ watermarkBottom: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-blue-200/80 bg-[#edf3fc] px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_SCHOOL_CONFIG)}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Govt. UGHS Malda</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-[#1c3570] px-4 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#142754] dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
