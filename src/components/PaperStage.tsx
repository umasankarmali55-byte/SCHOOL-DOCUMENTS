import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  FileText,
  Grid,
  Maximize2,
  Moon,
  Settings,
  Sun,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { SheetOrientation } from '../types/documents';

interface PaperStageProps {
  title: string;
  subtitle: string;
  orientation?: SheetOrientation;
  extraControls?: ReactNode;
  blankMode: boolean;
  onToggleBlankMode: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  children: ReactNode;
}

const MM_TO_PX = 3.7795275591;

export function PaperStage({
  title,
  subtitle,
  orientation = 'portrait',
  extraControls,
  blankMode,
  onToggleBlankMode,
  showGuides,
  onToggleGuides,
  isDark,
  onToggleTheme,
  onOpenSettings,
  children,
}: PaperStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.72);
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualScale, setManualScale] = useState(0.85);

  const sheetWidthPx = (orientation === 'landscape' ? 297 : 210) * MM_TO_PX;
  const sheetHeightPx = (orientation === 'landscape' ? 210 : 297) * MM_TO_PX;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateFit = () => {
      const availableWidth = el.clientWidth - 48;
      if (availableWidth > 0) {
        const nextScale = Math.min(1, Math.max(0.28, availableWidth / sheetWidthPx));
        setFitScale(nextScale);
      }
    };

    updateFit();
    const observer = new ResizeObserver(updateFit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sheetWidthPx]);

  const activeScale = zoomMode === 'fit' ? fitScale : manualScale;
  const displayPct = Math.round(activeScale * 100);

  const handleZoomOut = () => {
    const base = zoomMode === 'fit' ? fitScale : manualScale;
    setZoomMode('manual');
    setManualScale(Math.max(0.35, Math.round((base - 0.1) * 100) / 100));
  };

  const handleZoomIn = () => {
    const base = zoomMode === 'fit' ? fitScale : manualScale;
    setZoomMode('manual');
    setManualScale(Math.min(1.35, Math.round((base + 0.1) * 100) / 100));
  };

  const handleReset100 = () => {
    setZoomMode('manual');
    setManualScale(1);
  };

  const handleFit = () => {
    setZoomMode('fit');
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-gradient-to-br from-[#e2ebf8] via-[#d8e3f3] to-[#d0dced] dark:bg-[#080d18] dark:bg-none">
      {/* Workspace Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200/80 bg-[#f6f9ff]/95 px-4 py-2.5 backdrop-blur-xs sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#4a5e82] dark:text-slate-400">
            <span className="truncate font-semibold text-[#162b5a] dark:text-slate-100">
              {title}
            </span>
            <span aria-hidden="true" className="text-blue-300 dark:text-slate-600">
              ·
            </span>
            <span className="truncate">{subtitle}</span>
            <span aria-hidden="true" className="hidden text-blue-300 sm:inline dark:text-slate-600">
              ·
            </span>
            <span className="font-mono-tabular hidden font-medium text-[#2c4a86] sm:inline dark:text-slate-400">
              {orientation === 'landscape' ? 'A4 297 × 210 mm' : 'A4 210 × 297 mm'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {extraControls}
          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg border border-blue-200/90 bg-[#e8f0fc] p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom out"
              aria-label="Zoom out"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#294378] transition-colors hover:bg-white hover:text-[#162b5a] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleReset100}
              title="Set 100% scale"
              className="font-mono-tabular h-8 cursor-pointer whitespace-nowrap rounded-md px-2 text-xs font-semibold text-[#162b5a] transition-colors hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {displayPct}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom in"
              aria-label="Zoom in"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#294378] transition-colors hover:bg-white hover:text-[#162b5a] dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFit}
              title="Fit A4 page to viewport"
              className={`inline-flex h-8 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-2 text-xs font-medium transition-colors ${
                zoomMode === 'fit'
                  ? 'bg-[#1c3570] text-white shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-[#294378] hover:text-[#162b5a] dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Maximize2 className="h-3 w-3" />
              <span>Fit</span>
            </button>
          </div>

          {/* Blank Form Toggle */}
          <button
            type="button"
            onClick={onToggleBlankMode}
            title="Preview and print blank template lines for manual handwriting"
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium transition-colors ${
              blankMode
                ? 'border-[#1c3570] bg-[#1c3570] text-white shadow-xs dark:border-sky-500 dark:bg-sky-600'
                : 'border-blue-200 bg-white text-[#1c3570] hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{blankMode ? 'Blank Template On' : 'Blank Template'}</span>
          </button>

          {/* Margin Guides Toggle */}
          <button
            type="button"
            onClick={onToggleGuides}
            title="Toggle screen-only print margin guides"
            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 text-xs font-medium transition-colors ${
              showGuides
                ? 'border-[#2563eb] bg-blue-100/80 text-[#1d4ed8] dark:border-sky-400 dark:bg-slate-800 dark:text-sky-300'
                : 'border-blue-200 bg-white text-[#294378] hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Guides</span>
          </button>

          {/* School Header Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Customize school letterhead and codes"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300/90 bg-amber-50/80 px-2.5 text-xs font-medium text-amber-950 transition-colors hover:border-amber-400 hover:bg-amber-100/80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Settings className="h-3.5 w-3.5 text-amber-700 dark:text-slate-300" />
            <span className="hidden xl:inline">School Header</span>
          </button>

          {/* Light / Dark Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to light workspace' : 'Switch to dark workspace'}
            aria-label={isDark ? 'Switch to light workspace' : 'Switch to dark workspace'}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-white text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Live Scaled A4 Document Desk */}
      <div
        ref={containerRef}
        className="flex flex-1 justify-center overflow-auto px-4 py-6 sm:px-6 sm:py-8"
      >
        <div
          style={{
            width: `${Math.ceil(sheetWidthPx * activeScale)}px`,
            height: `${Math.ceil(sheetHeightPx * activeScale)}px`,
          }}
          className="relative shrink-0"
        >
          <div
            style={{
              transform: `scale(${activeScale})`,
              transformOrigin: 'top left',
            }}
            className="absolute top-0 left-0"
          >
            {children}
          </div>
        </div>
      </div>

      {/* Quiet Print Tip Footer */}
      <div className="border-t border-blue-200/80 bg-[#edf3fc]/95 px-4 py-2 text-xs text-[#43567a] sm:px-6 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
        Print setup: Paper{' '}
        <strong className="font-semibold text-[#162b5a] dark:text-slate-200">
          {orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}
        </strong>{' '}
        · Margins{' '}
        <strong className="font-semibold text-[#162b5a] dark:text-slate-200">None</strong> · Scale{' '}
        <strong className="font-semibold text-[#162b5a] dark:text-slate-200">100%</strong> · Enable{' '}
        <strong className="font-semibold text-[#162b5a] dark:text-slate-200">
          Background graphics
        </strong>{' '}
        for crest, borders, and seal watermark.
      </div>
    </section>
  );
}
