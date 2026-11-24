import { ChangeEvent, useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Moon,
  Plus,
  Printer,
  Search,
  Settings,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  RegistryRecord,
  computeMarkSheetAnalytics,
  formatSlashDate,
} from '../types/documents';

type RegistryFilter = 'all' | 'cert' | 'conduct' | 'p' | 'u' | 's';

interface StudentRegistryProps {
  records: RegistryRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onOpenRecord: (record: RegistryRecord) => void;
  onDuplicateRecord: (record: RegistryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onPrintRecords: (records: RegistryRecord[]) => void;
  onCreateNew: (kind: 'cert' | 'conduct' | 'p') => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onLoadSamples: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const KIND_LABELS: Record<RegistryRecord['kind'], string> = {
  cert: 'Study Certificate',
  conduct: 'Conduct-cum-Character',
  p: 'Primary Mark Sheet',
  u: 'Upper Primary Mark Sheet',
  s: 'Secondary Mark Sheet',
};

const KIND_TEXT_COLORS: Record<RegistryRecord['kind'], string> = {
  cert: 'text-[#1c3570] dark:text-sky-300',
  conduct: 'text-teal-700 dark:text-teal-300',
  p: 'text-indigo-700 dark:text-indigo-300',
  u: 'text-blue-700 dark:text-blue-300',
  s: 'text-amber-800 dark:text-amber-300',
};

export function StudentRegistry({
  records,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenRecord,
  onDuplicateRecord,
  onDeleteRecord,
  onPrintRecords,
  onCreateNew,
  onExportCsv,
  onExportJson,
  onImportJson,
  onLoadSamples,
  isDark,
  onToggleTheme,
  onOpenSettings,
}: StudentRegistryProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RegistryFilter>('all');
  const importRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((rec) => {
      if (filter !== 'all' && rec.kind !== filter) return false;
      if (!q) return true;
      return (
        rec.studentName.toLowerCase().includes(q) ||
        rec.fatherName.toLowerCase().includes(q) ||
        rec.cls.toLowerCase().includes(q) ||
        rec.identifier.toLowerCase().includes(q) ||
        rec.session.toLowerCase().includes(q)
      );
    });
  }, [records, query, filter]);

  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered]);
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));

  const selectedRecords = useMemo(
    () => records.filter((r) => selectedIds.includes(r.id)),
    [records, selectedIds]
  );

  const counts = useMemo(() => {
    const c = { total: records.length, cert: 0, conduct: 0, ms: 0 };
    for (const r of records) {
      if (r.kind === 'cert') c.cert += 1;
      else if (r.kind === 'conduct') c.conduct += 1;
      else c.ms += 1;
    }
    return c;
  }, [records]);

  const handleImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportJson(file);
    e.target.value = '';
  };

  return (
    <main className="no-print mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-blue-200/80 pb-5 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#162b5a] dark:text-slate-100">
            Student Document Registry
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#4a5e82] dark:text-slate-400">
            <span className="font-mono-tabular font-semibold text-[#162b5a] dark:text-slate-200">
              {counts.total} saved records
            </span>
            <span aria-hidden="true" className="text-blue-300 dark:text-slate-600">
              ·
            </span>
            <span className="font-mono-tabular">{counts.cert} study certificates</span>
            <span aria-hidden="true" className="text-blue-300 dark:text-slate-600">
              ·
            </span>
            <span className="font-mono-tabular">{counts.conduct} conduct certificates</span>
            <span aria-hidden="true" className="text-blue-300 dark:text-slate-600">
              ·
            </span>
            <span className="font-mono-tabular">{counts.ms} mark sheets</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={onExportCsv}
            disabled={records.length === 0}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-teal-200 bg-teal-50/80 px-3 text-xs font-medium text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-teal-700 dark:text-slate-300" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onExportJson}
            disabled={records.length === 0}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Backup JSON</span>
          </button>
          <button
            type="button"
            onClick={() => importRef.current?.click()}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import JSON</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-amber-300/90 bg-amber-50/80 px-3 text-xs font-medium text-amber-950 transition-colors hover:border-amber-400 hover:bg-amber-100/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Settings className="h-3.5 w-3.5 text-amber-700 dark:text-slate-300" />
            <span>School Header</span>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light workspace' : 'Switch to dark workspace'}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-white text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#5c7399] dark:text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, father, ID, class..."
              className="h-10 w-full rounded-lg border border-blue-200/90 bg-white pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:ring-0"
            />
          </div>

          {/* Segmented Type Filter */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-blue-200/80 bg-[#dce7f8] p-1 dark:border-transparent dark:bg-slate-900">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'cert', label: 'Study Cert' },
                { id: 'conduct', label: 'Conduct Cert' },
                { id: 'p', label: 'Primary' },
                { id: 'u', label: 'Upper Primary' },
                { id: 's', label: 'Secondary' },
              ] as { id: RegistryFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`h-8 cursor-pointer whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-[#1c3570] font-semibold text-white shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-[#2c4478] hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Batch Print Selection Action */}
        <div className="flex items-center gap-2">
          {selectedRecords.length > 0 && (
            <button
              type="button"
              onClick={() => onPrintRecords(selectedRecords)}
              className="inline-flex h-10 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#1c3570] px-4 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#142754] dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              <Printer className="h-4 w-4" />
              <span>Batch Print ({selectedRecords.length} A4 Pages)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onCreateNew('cert')}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3.5 text-xs font-semibold text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span>New Study Certificate</span>
          </button>
        </div>
      </div>

      {/* Data Table / Empty State */}
      <div className="mt-5 overflow-hidden rounded-xl border border-blue-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
        {records.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              No saved student documents yet
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Save any Study Certificate or Mark Sheet from the editor to build your school
              issuance register and batch print multiple A4 sheets at once.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onCreateNew('cert')}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#1c2f5e] px-4 text-sm font-medium text-white transition-colors hover:bg-[#15244a] dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Certificate</span>
              </button>
              <button
                type="button"
                onClick={onLoadSamples}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>Load Sample Records</span>
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No matching records found
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search query or document type filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
              className="mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-blue-200/90 bg-[#e6eefc] text-xs font-semibold text-[#162b5a] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
                  <th className="w-11 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all visible records"
                      checked={allFilteredSelected}
                      onChange={() => onToggleSelectAll(filteredIds)}
                      className="h-4 w-4 cursor-pointer rounded border-blue-300 accent-[#1c3570] dark:border-slate-600"
                    />
                  </th>
                  <th className="px-4 py-3">Student &amp; Parentage</th>
                  <th className="px-4 py-3">Document Format</th>
                  <th className="px-4 py-3">Class / Session</th>
                  <th className="px-4 py-3">ID / Roll No.</th>
                  <th className="px-4 py-3 text-right">Score / Issue Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/90 dark:divide-slate-800/80">
                {filtered.map((rec) => {
                  const isSelected = selectedIds.includes(rec.id);
                  const msStats = rec.markSheetData
                    ? computeMarkSheetAnalytics(rec.markSheetData)
                    : null;

                  return (
                    <tr
                      key={rec.id}
                      className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-900/60 ${
                        isSelected ? 'bg-blue-100/50 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${rec.studentName || 'Untitled record'}`}
                          checked={isSelected}
                          onChange={() => onToggleSelect(rec.id)}
                          className="h-4 w-4 cursor-pointer rounded border-blue-300 accent-[#1c3570] dark:border-slate-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#162b5a] dark:text-slate-100">
                          {rec.studentName || 'Untitled Student'}
                        </div>
                        <div className="text-xs text-[#4a5e82] dark:text-slate-400">
                          {rec.fatherName ? `C/o Sri ${rec.fatherName}` : 'Parentage not entered'}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-xs font-semibold ${KIND_TEXT_COLORS[rec.kind]}`}>
                        {KIND_LABELS[rec.kind]}
                        {(rec.kind === 'p' || rec.kind === 'u') &&
                          rec.markSheetData?.formatVersion === 'legacy' && (
                            <span className="ml-1 font-normal text-slate-500 dark:text-slate-500">
                              (Older)
                            </span>
                          )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
                        <span>{rec.cls || '—'}</span>
                        <span className="mx-1.5 text-blue-300 dark:text-slate-700">·</span>
                        <span className="font-mono-tabular">{rec.session || '—'}</span>
                      </td>
                      <td className="font-mono-tabular px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
                        {rec.identifier || '—'}
                      </td>
                      <td className="font-mono-tabular px-4 py-3 text-right text-xs">
                        {msStats && msStats.filledCount > 0 ? (
                          <div>
                            <div className="font-semibold text-teal-700 dark:text-slate-100">
                              {msStats.securedTotal}/{msStats.maxTotal} (
                              {msStats.percentage?.toFixed(1)}%)
                            </div>
                            <div className="text-[#54688c] dark:text-slate-400">
                              {rec.issueDate ? formatSlashDate(rec.issueDate) : 'No issue date'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#4a5e82] dark:text-slate-400">
                            {rec.issueDate ? formatSlashDate(rec.issueDate) : '—'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenRecord(rec)}
                            title="Open in editor"
                            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-semibold text-[#1d4ed8] transition-colors hover:bg-blue-100/70 dark:text-sky-400 dark:hover:bg-slate-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onPrintRecords([rec])}
                            title="Print this A4 sheet"
                            aria-label={`Print ${rec.studentName}`}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#294378] transition-colors hover:bg-blue-100/70 hover:text-[#162b5a] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateRecord(rec)}
                            title="Duplicate record"
                            aria-label={`Duplicate ${rec.studentName}`}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#294378] transition-colors hover:bg-blue-100/70 hover:text-[#162b5a] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(rec.id)}
                            title="Delete record"
                            aria-label={`Delete ${rec.studentName}`}
                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
