import { useState } from 'react';
import { Menu, Printer, X } from 'lucide-react';
import { ActiveView } from '../types/documents';

interface TopBarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onPrimaryAction: () => void;
  primaryActionLabel: string;
  registryCount: number;
}

const NAV_ITEMS: { id: ActiveView; label: string; matches?: ActiveView[] }[] = [
  { id: 'cert', label: 'Study Certificate' },
  { id: 'conduct', label: 'Conduct Certificate' },
  { id: 'ms-primary', label: 'Primary / UP', matches: ['ms-primary', 'ms-upper'] },
  { id: 'ms-secondary', label: 'Secondary' },
  { id: 'registry', label: 'Registry' },
];

export function TopBar({
  activeView,
  onSelectView,
  onPrimaryAction,
  primaryActionLabel,
  registryCount,
}: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isNavItemActive = (item: (typeof NAV_ITEMS)[number]) =>
    item.matches ? item.matches.includes(activeView) : activeView === item.id;

  return (
    <header className="no-print sticky top-0 z-30 border-b-2 border-[#c89b3c] bg-gradient-to-r from-[#14254a] via-[#1c3468] to-[#193b75] text-white shadow-sm dark:border-b dark:border-slate-800 dark:bg-slate-950/95 dark:bg-none dark:text-slate-100 dark:shadow-none">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('cert')}
          className="font-display shrink-0 cursor-pointer whitespace-nowrap text-base font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2c14e] dark:text-slate-100 dark:focus-visible:outline-sky-400"
        >
          Govt. UGHS Malda
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Document templates and registry"
          className="hidden items-center gap-6 lg:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative shrink-0 cursor-pointer whitespace-nowrap py-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2c14e] dark:focus-visible:outline-sky-400 ${
                  isActive
                    ? 'font-semibold text-white dark:text-sky-300'
                    : 'text-blue-100/80 hover:text-white dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'registry' && registryCount > 0 && (
                  <span className="font-mono-tabular ml-1.5 text-xs text-amber-200/90 dark:text-slate-500">
                    ({registryCount})
                  </span>
                )}
                {isActive && (
                  <span className="absolute right-0 bottom-0 left-0 h-[3px] rounded-t-full bg-[#f2c14e] dark:h-0.5 dark:rounded-none dark:bg-sky-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#f2b830] px-4 text-sm font-semibold text-[#112042] shadow-xs transition-colors duration-150 hover:bg-[#e5a91e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-sky-600 dark:font-medium dark:text-white dark:shadow-none dark:hover:bg-sky-500"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span>{primaryActionLabel}</span>
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 lg:hidden dark:border-slate-800 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive mobile nav drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/15 bg-[#14254a] px-4 py-2 lg:hidden dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectView(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 font-semibold text-[#f7cf6c] dark:bg-slate-900 dark:text-sky-300'
                      : 'text-blue-100 hover:bg-white/10 dark:text-slate-300 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'registry' && (
                    <span className="font-mono-tabular text-xs text-amber-200/80 dark:text-slate-500">
                      {registryCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
