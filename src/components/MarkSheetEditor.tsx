import { KeyboardEvent } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  Calendar,
  Eraser,
  Hash,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import {
  MARK_SHEET_LABELS,
  MarkRowValue,
  MarkSheetData,
  MarkSheetFormatVersion,
  MarkSheetKind,
  computeMarkSheetAnalytics,
  createDefaultCurrentRows,
  createDefaultLegacyRows,
  createEmptyLegacyMarks,
  getActiveMarkRows,
  getRemarkForScore,
  getTodayIso,
  isLegacyMarkSheet,
} from '../types/documents';

interface MarkSheetEditorProps {
  data: MarkSheetData;
  onChange: (next: MarkSheetData) => void;
  onSwitchKind: (kind: MarkSheetKind) => void;
  onSaveToRegistry: () => void;
  onCopyFromCert: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  editingRecordId: string | null;
}

const INPUT_CLASS =
  'h-10 w-full rounded-lg border border-blue-200/90 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-0';

const LABEL_CLASS =
  'mb-1.5 block text-xs font-medium text-[#3b4f74] dark:text-slate-400';

export function MarkSheetEditor({
  data,
  onChange,
  onSwitchKind,
  onSaveToRegistry,
  onCopyFromCert,
  onLoadSample,
  onClear,
  editingRecordId,
}: MarkSheetEditorProps) {
  const kind = data.type;
  const isSecondary = kind === 's';
  const isLegacy = isLegacyMarkSheet(data);
  const isSingleScoreMode = isLegacy || isSecondary;
  const hasRegRoll = kind !== 'p';
  const formatVersion: MarkSheetFormatVersion = data.formatVersion || 'current';
  const legacyKind: 'p' | 'u' = kind === 'u' ? 'u' : 'p';

  const rows = getActiveMarkRows(data);
  const analytics = computeMarkSheetAnalytics(data);
  const meta = MARK_SHEET_LABELS[kind];

  const patch = (partial: Partial<MarkSheetData>) => {
    onChange({ ...data, ...partial });
  };

  const commitRows = (nextRows: MarkRowValue[]) => {
    if (isLegacy) {
      const baseLegacy = data.legacyMarks || createEmptyLegacyMarks();
      onChange({
        ...data,
        legacyMarks: {
          ...baseLegacy,
          [legacyKind]: nextRows,
        },
      });
      return;
    }

    onChange({
      ...data,
      marks: {
        ...data.marks,
        [kind]: nextRows,
      },
    });
  };

  const handleSetFormatVersion = (version: MarkSheetFormatVersion) => {
    patch({
      formatVersion: version,
      legacyMarks: data.legacyMarks || createEmptyLegacyMarks(),
    });
  };

  const handleRowFieldChange = (
    index: number,
    field: 'subject' | 'fullMarks' | 'col1' | 'col2',
    value: string
  ) => {
    const nextRows = rows.map((row, idx) =>
      idx === index ? { ...row, [field]: value } : row
    );
    commitRows(nextRows);
  };

  const handleAddSubject = () => {
    const newRow: MarkRowValue = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subject: '',
      fullMarks: isLegacy ? '' : '100',
      col1: '',
      col2: '',
    };
    const nextRows = [...rows, newRow];
    commitRows(nextRows);

    const newIndex = nextRows.length - 1;
    const prefix = isLegacy ? `legacy-${legacyKind}` : `mark-${kind}`;
    window.setTimeout(() => {
      document.getElementById(`${prefix}-${newIndex}-subject`)?.focus();
    }, 20);
  };

  const handleDeleteSubject = (index: number) => {
    if (rows.length <= 1) {
      commitRows([
        {
          ...rows[0],
          subject: '',
          fullMarks: isLegacy ? '' : '100',
          col1: '',
          col2: '',
        },
      ]);
      return;
    }
    const nextRows = rows.filter((_, idx) => idx !== index);
    commitRows(nextRows);
  };

  const handleResetSubjects = () => {
    const defaults = isLegacy
      ? createDefaultLegacyRows(legacyKind)
      : createDefaultCurrentRows(kind);
    commitRows(defaults);
  };

  const handleFillAllFullMarks100 = () => {
    const nextRows = rows.map((row) => ({ ...row, fullMarks: '100' }));
    commitRows(nextRows);
  };

  const handleAutoRemarks = () => {
    if (!isSingleScoreMode) return;
    const nextRows = rows.map((row) => ({
      ...row,
      col2: row.col1.trim() ? getRemarkForScore(row.col1, row.fullMarks) : row.col2,
    }));
    commitRows(nextRows);
  };

  const handleEnterMove = (
    e: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    col: 'subject' | 'fullMarks' | 'col1' | 'col2'
  ) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const prefix = isLegacy ? `legacy-${legacyKind}` : `mark-${kind}`;
    const nextRow = rowIndex + 1;
    if (nextRow < rows.length) {
      document.getElementById(`${prefix}-${nextRow}-${col}`)?.focus();
    } else if (col === 'subject') {
      document.getElementById(`${prefix}-0-fullMarks`)?.focus();
    } else if (col === 'fullMarks') {
      document.getElementById(`${prefix}-0-col1`)?.focus();
    } else if (col === 'col1') {
      document.getElementById(`${prefix}-0-col2`)?.focus();
    }
  };

  const isInvalidNumeric = (val: string, maxVal = 100) => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const n = Number(trimmed);
    return Number.isNaN(n) || n < 0 || n > maxVal;
  };

  const isInvalidFullMarks = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return false;
    const n = Number(trimmed);
    return Number.isNaN(n) || n <= 0;
  };

  const prefix = isLegacy ? `legacy-${legacyKind}` : `mark-${kind}`;

  return (
    <aside className="no-print flex w-full shrink-0 flex-col border-b border-blue-200/80 bg-[#f7faff] lg:w-[470px] lg:border-r lg:border-b-0 xl:w-[500px] dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-blue-200/80 bg-gradient-to-br from-[#e9f1ff] via-[#f2f6ff] to-[#fdf8eb] px-5 py-4 dark:border-slate-800 dark:bg-slate-950 dark:bg-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-[#162b5a] dark:text-slate-100">
              {meta.short} Mark Sheet
            </h1>
            <p className="font-mono-tabular mt-0.5 text-xs text-[#4a5e82] dark:text-slate-400">
              {isLegacy ? 'Older Annual Exam · ' : ''}
              {rows.length} {rows.length === 1 ? 'subject' : 'subjects'} · Max {analytics.maxTotal}{' '}
              marks
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveToRegistry}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1c3570] px-3 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#142754] dark:border dark:border-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:shadow-none dark:hover:bg-white"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{editingRecordId ? 'Update Record' : 'Save Record'}</span>
          </button>
        </div>

        {/* Segmented Class Level Switcher */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-blue-200/70 bg-[#dfe9fa] p-1 dark:border-transparent dark:bg-slate-900">
          {(
            [
              { id: 'p', label: 'Primary' },
              { id: 'u', label: 'Upper Primary' },
              { id: 's', label: 'Secondary' },
            ] as { id: MarkSheetKind; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSwitchKind(item.id)}
              className={`h-8 cursor-pointer whitespace-nowrap rounded-md px-2 text-xs font-medium transition-colors ${
                kind === item.id
                  ? 'bg-[#1c3570] font-semibold text-white shadow-xs dark:bg-slate-800 dark:text-white'
                  : 'text-[#2c4478] hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Table Format Version Switcher (Primary & Upper Primary only) */}
        {!isSecondary && (
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[#3b4f74] dark:text-slate-400">Table version:</span>
            <div className="inline-flex rounded-md border border-blue-200/80 bg-[#e6effd] p-0.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => handleSetFormatVersion('current')}
                className={`h-7 cursor-pointer whitespace-nowrap rounded px-2.5 text-xs font-medium transition-colors ${
                  formatVersion === 'current'
                    ? 'bg-[#1c3570] text-white shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-[#2c4478] hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Current (Term 1 &amp; 2)
              </button>
              <button
                type="button"
                onClick={() => handleSetFormatVersion('legacy')}
                className={`h-7 cursor-pointer whitespace-nowrap rounded px-2.5 text-xs font-medium transition-colors ${
                  formatVersion === 'legacy'
                    ? 'bg-[#1c3570] text-white shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-[#2c4478] hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Older (Annual Exam)
              </button>
            </div>
          </div>
        )}

        {/* Utility row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyFromCert}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-200/90 bg-white px-2.5 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Sync from Certificate</span>
          </button>
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-teal-200 bg-teal-50/80 px-2.5 text-xs font-medium text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100/80 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-700 dark:text-slate-300" />
            <span>Fill Sample</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-200/90 bg-white px-2.5 text-xs font-medium text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-red-900/60 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Student Details */}
        <div>
          <h2 className="font-display mb-3 text-sm font-semibold text-[#162b5a] dark:text-slate-100">
            Student Details
          </h2>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="ms-name" className={LABEL_CLASS}>
                Name of the student
              </label>
              <input
                id="ms-name"
                type="text"
                value={data.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Lipsa Rani Nayak"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ms-father" className={LABEL_CLASS}>
                  Father&apos;s name
                </label>
                <input
                  id="ms-father"
                  type="text"
                  value={data.father}
                  onChange={(e) => patch({ father: e.target.value })}
                  placeholder="Father's name"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="ms-mother" className={LABEL_CLASS}>
                  Mother&apos;s name
                </label>
                <input
                  id="ms-mother"
                  type="text"
                  value={data.mother}
                  onChange={(e) => patch({ mother: e.target.value })}
                  placeholder="Mother's name"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ms-dob" className={LABEL_CLASS}>
                  Date of birth
                </label>
                <input
                  id="ms-dob"
                  type="date"
                  value={data.dob}
                  onChange={(e) => patch({ dob: e.target.value })}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
              <div>
                <label htmlFor="ms-ses" className={LABEL_CLASS}>
                  Education session
                </label>
                <input
                  id="ms-ses"
                  type="text"
                  value={data.ses}
                  onChange={(e) => patch({ ses: e.target.value })}
                  placeholder={isLegacy ? 'e.g. 2016-17' : '2024-25'}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
            </div>

            {hasRegRoll && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ms-reg" className={LABEL_CLASS}>
                    Registration no.
                  </label>
                  <input
                    id="ms-reg"
                    type="text"
                    value={data.reg}
                    onChange={(e) => patch({ reg: e.target.value })}
                    placeholder="e.g. REG-216FA-109"
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label htmlFor="ms-roll" className={LABEL_CLASS}>
                    Roll no.
                  </label>
                  <input
                    id="ms-roll"
                    type="text"
                    value={data.roll}
                    onChange={(e) => patch({ roll: e.target.value })}
                    placeholder="e.g. 14"
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ms-cls" className={LABEL_CLASS}>
                  Class issued
                </label>
                <input
                  id="ms-cls"
                  type="text"
                  value={data.cls}
                  onChange={(e) => patch({ cls: e.target.value })}
                  placeholder={kind === 'p' ? 'e.g. 5th' : kind === 'u' ? 'e.g. 7th' : 'e.g. 9th'}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="ms-issue"
                    className="text-xs font-medium text-[#3b4f74] dark:text-slate-400"
                  >
                    Date of issue
                  </label>
                  <button
                    type="button"
                    onClick={() => patch({ issue: getTodayIso() })}
                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#1d4ed8] hover:underline dark:text-sky-400"
                  >
                    <Calendar className="h-3 w-3" />
                    Today
                  </button>
                </div>
                <input
                  id="ms-issue"
                  type="date"
                  value={data.issue}
                  onChange={(e) => patch({ issue: e.target.value })}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-blue-100 dark:border-slate-800" />

        {/* Marks Ledger (Editable Subject Name, Editable Full Marks, Add & Delete Rows) */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-semibold text-[#162b5a] dark:text-slate-100">
                Subjects &amp; Marks Ledger
              </h2>
              <p className="text-[11px] text-[#4a5e82] dark:text-slate-400">
                Edit subject names or full marks · Add or delete rows anytime
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleFillAllFullMarks100}
                title="Set Full Marks to 100 for all rows"
                className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-blue-200 bg-white px-2 text-[11px] font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Hash className="h-3 w-3" />
                <span>All 100</span>
              </button>
              {isSingleScoreMode && (
                <button
                  type="button"
                  onClick={handleAutoRemarks}
                  className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-teal-200 bg-teal-50/80 px-2 text-[11px] font-medium text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>Auto Remarks</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetSubjects}
                title="Restore default official subjects for this format"
                className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-amber-200/90 bg-amber-50/70 px-2 text-[11px] font-medium text-amber-900 transition-colors hover:border-amber-300 hover:bg-amber-100/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Compact Live Summary Strip */}
          <div className="mb-3 grid grid-cols-3 divide-x divide-blue-200/80 rounded-lg border border-blue-200/90 bg-gradient-to-r from-[#eaf1ff] via-[#f4f8ff] to-[#fdf8eb] py-2.5 text-center dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70 dark:bg-none">
            <div className="px-2">
              <div className="text-[11px] font-medium text-[#4a5e82] dark:text-slate-400">
                Total Secured
              </div>
              <div className="font-mono-tabular mt-0.5 text-sm font-bold text-[#162b5a] dark:text-slate-100">
                {analytics.filledCount > 0 ? analytics.securedTotal : '—'}{' '}
                <span className="text-xs font-normal text-[#64789c] dark:text-slate-400">
                  / {analytics.maxTotal}
                </span>
              </div>
            </div>
            <div className="px-2">
              <div className="text-[11px] font-medium text-[#4a5e82] dark:text-slate-400">
                Percentage
              </div>
              <div className="font-mono-tabular mt-0.5 text-sm font-bold text-teal-700 dark:text-slate-100">
                {analytics.percentage !== null ? `${analytics.percentage.toFixed(1)}%` : '—'}
              </div>
            </div>
            <div className="px-2">
              <div className="text-[11px] font-medium text-[#4a5e82] dark:text-slate-400">
                Indicative Grade
              </div>
              <div className="font-mono-tabular mt-0.5 text-sm font-bold text-[#1d4ed8] dark:text-sky-400">
                {analytics.grade}
              </div>
            </div>
          </div>

          {analytics.invalidCount > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {analytics.invalidCount} mark{' '}
                {analytics.invalidCount === 1 ? 'entry exceeds' : 'entries exceed'} valid full marks.
              </span>
            </div>
          )}

          {/* Dynamic Editable Subjects & Marks Table */}
          <div className="overflow-hidden rounded-lg border border-blue-200/90 bg-white dark:border-slate-800 dark:bg-transparent">
            <div
              className={`grid items-center gap-1.5 border-b border-blue-200/90 bg-[#e6eefc] px-2.5 py-2 text-[11px] font-semibold text-[#162b5a] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 ${
                isSingleScoreMode
                  ? 'grid-cols-[18px_1fr_50px_54px_76px_26px]'
                  : 'grid-cols-[18px_1fr_50px_54px_54px_26px]'
              }`}
            >
              <span>#</span>
              <span>Subject</span>
              <span className="text-center">Full</span>
              <span className="text-center">{isSingleScoreMode ? 'Sec.' : 'T-1'}</span>
              <span className="text-center">{isSingleScoreMode ? 'Remarks' : 'T-2'}</span>
              <span className="sr-only">Delete</span>
            </div>

            <div className="divide-y divide-blue-100/90 dark:divide-slate-800/80">
              {rows.map((row, idx) => {
                const fmVal = row.fullMarks ?? '';
                const rowMax =
                  fmVal.trim() && !Number.isNaN(Number(fmVal)) && Number(fmVal) > 0
                    ? Number(fmVal)
                    : 100;
                const badFm = isInvalidFullMarks(fmVal);
                const bad1 = isInvalidNumeric(row.col1, rowMax);
                const bad2 = !isSingleScoreMode && isInvalidNumeric(row.col2, rowMax);

                return (
                  <div
                    key={row.id || idx}
                    className={`grid items-center gap-1.5 px-2.5 py-1.5 transition-colors hover:bg-blue-50/60 dark:hover:bg-slate-900/40 ${
                      isSingleScoreMode
                        ? 'grid-cols-[18px_1fr_50px_54px_76px_26px]'
                        : 'grid-cols-[18px_1fr_50px_54px_54px_26px]'
                    }`}
                  >
                    <span className="font-mono-tabular text-[11px] font-medium text-[#5e7399] dark:text-slate-400">
                      {idx + 1}.
                    </span>

                    <input
                      id={`${prefix}-${idx}-subject`}
                      type="text"
                      aria-label={`Row ${idx + 1} Subject name`}
                      value={row.subject ?? ''}
                      onChange={(e) => handleRowFieldChange(idx, 'subject', e.target.value)}
                      onKeyDown={(e) => handleEnterMove(e, idx, 'subject')}
                      placeholder="Subject name"
                      className="h-8 w-full min-w-0 rounded-md border border-transparent bg-transparent px-1.5 text-xs font-medium text-[#162b5a] transition-colors hover:border-blue-200 hover:bg-white focus:border-[#1c3570] focus:bg-white focus:outline-none dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus:border-sky-400 dark:focus:bg-slate-900"
                    />

                    <input
                      id={`${prefix}-${idx}-fullMarks`}
                      type="text"
                      inputMode="numeric"
                      aria-label={`${row.subject || `Row ${idx + 1}`} Full Marks`}
                      value={fmVal}
                      onChange={(e) => handleRowFieldChange(idx, 'fullMarks', e.target.value)}
                      onKeyDown={(e) => handleEnterMove(e, idx, 'fullMarks')}
                      placeholder="100"
                      className={`font-mono-tabular h-8 w-full rounded-md border px-1 text-center text-xs transition-colors focus:outline-none ${
                        badFm
                          ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'border-blue-200/90 bg-[#f8fbff] text-slate-900 focus:border-[#1c3570] focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400'
                      }`}
                    />

                    <input
                      id={`${prefix}-${idx}-col1`}
                      type="text"
                      inputMode="numeric"
                      aria-label={`${row.subject || `Row ${idx + 1}`} ${
                        isSingleScoreMode ? 'Secured Marks' : 'Term 1'
                      }`}
                      value={row.col1}
                      onChange={(e) => handleRowFieldChange(idx, 'col1', e.target.value)}
                      onKeyDown={(e) => handleEnterMove(e, idx, 'col1')}
                      placeholder={isSingleScoreMode ? 'Marks' : 'T-1'}
                      className={`font-mono-tabular h-8 w-full rounded-md border px-1 text-center text-xs transition-colors focus:outline-none ${
                        bad1
                          ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'border-blue-200/90 bg-white text-slate-900 focus:border-[#1c3570] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400'
                      }`}
                    />

                    <input
                      id={`${prefix}-${idx}-col2`}
                      type="text"
                      inputMode={isSingleScoreMode ? 'text' : 'numeric'}
                      aria-label={`${row.subject || `Row ${idx + 1}`} ${
                        isSingleScoreMode ? 'Remarks' : 'Term 2'
                      }`}
                      value={row.col2}
                      onChange={(e) => handleRowFieldChange(idx, 'col2', e.target.value)}
                      onKeyDown={(e) => handleEnterMove(e, idx, 'col2')}
                      placeholder={isSingleScoreMode ? 'Remarks' : 'T-2'}
                      className={`h-8 w-full rounded-md border px-1.5 text-xs transition-colors focus:outline-none ${
                        isSingleScoreMode ? 'text-left' : 'font-mono-tabular text-center'
                      } ${
                        bad2
                          ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'border-blue-200/90 bg-white text-slate-900 focus:border-[#1c3570] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(idx)}
                      title={`Delete ${row.subject || `row ${idx + 1}`}`}
                      aria-label={`Delete ${row.subject || `row ${idx + 1}`}`}
                      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSubject}
            className="mt-2.5 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 text-xs font-semibold text-[#1c3570] transition-colors hover:border-[#1c3570] hover:bg-blue-100/70 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subject Row</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
