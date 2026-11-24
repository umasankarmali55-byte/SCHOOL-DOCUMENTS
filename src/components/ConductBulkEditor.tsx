import { ChangeEvent, useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Copy,
  Download,
  Eraser,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ConductBulkBatch,
  ConductBulkStudent,
  ConductRelationOption,
  getTodayIso,
  parseConductBulkText,
} from '../types/documents';

interface ConductBulkEditorProps {
  batch: ConductBulkBatch;
  onChange: (next: ConductBulkBatch) => void;
  activePageIndex: number;
  onSelectPage: (pageIdx: number) => void;
  onSwitchToSingle: () => void;
  onSaveBatchToRegistry: () => void;
  onLoadDemoBatch: () => void;
  onClearBatch: () => void;
}

const INPUT_CLASS =
  'h-9 w-full rounded-lg border border-blue-200/90 bg-white px-2.5 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-0';

const LABEL_CLASS =
  'mb-1 block text-[11px] font-medium text-[#3b4f74] dark:text-slate-400';

export function ConductBulkEditor({
  batch,
  onChange,
  activePageIndex,
  onSelectPage,
  onSwitchToSingle,
  onSaveBatchToRegistry,
  onLoadDemoBatch,
  onClearBatch,
}: ConductBulkEditorProps) {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const csvInputRef = useRef<HTMLInputElement>(null);

  const pageCount = Math.max(1, Math.ceil(batch.students.length / 2));

  const patchBatch = (partial: Partial<ConductBulkBatch>) => {
    onChange({ ...batch, ...partial });
  };

  const updateStudent = (id: string, partial: Partial<ConductBulkStudent>) => {
    patchBatch({
      students: batch.students.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    });
  };

  const handleRelationChange = (id: string, rel: ConductRelationOption) => {
    const pro = rel === 'S/o' ? 'His' : rel === 'D/o' ? 'Her' : '';
    updateStudent(id, { rel, pro });
  };

  const handleAddStudent = () => {
    const nextStudent: ConductBulkStudent = {
      id: `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serialNo: '',
      name: '',
      father: '',
      rel: 'S/o',
      pro: 'His',
      characterRating: '',
    };
    const nextStudents = [...batch.students, nextStudent];
    patchBatch({ students: nextStudents });
    onSelectPage(Math.floor((nextStudents.length - 1) / 2));
  };

  const handleDuplicateStudent = (student: ConductBulkStudent, idx: number) => {
    const clone: ConductBulkStudent = {
      ...student,
      id: `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      serialNo: '',
    };
    const next = [...batch.students];
    next.splice(idx + 1, 0, clone);
    patchBatch({ students: next });
  };

  const handleDeleteStudent = (id: string) => {
    if (batch.students.length <= 1) {
      updateStudent(id, { name: '', father: '', serialNo: '', characterRating: '' });
      return;
    }
    const next = batch.students.filter((s) => s.id !== id);
    patchBatch({ students: next });
    const maxPage = Math.max(0, Math.ceil(next.length / 2) - 1);
    if (activePageIndex > maxPage) onSelectPage(maxPage);
  };

  const handleMoveStudent = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= batch.students.length) return;
    const next = [...batch.students];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    patchBatch({ students: next });
    onSelectPage(Math.floor(target / 2));
  };

  const handleApplyPaste = (replaceExisting: boolean) => {
    const parsed = parseConductBulkText(pasteText);
    if (parsed.length === 0) return;

    const existingNonEmpty = batch.students.filter(
      (s) => s.name.trim() !== '' || s.father.trim() !== ''
    );
    const nextStudents = replaceExisting ? parsed : [...existingNonEmpty, ...parsed];
    patchBatch({ students: nextStudents });
    setPasteText('');
    setPasteOpen(false);
    onSelectPage(0);
  };

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseConductBulkText(String(reader.result || ''));
      if (parsed.length > 0) {
        const existingNonEmpty = batch.students.filter(
          (s) => s.name.trim() !== '' || s.father.trim() !== ''
        );
        patchBatch({ students: [...existingNonEmpty, ...parsed] });
        onSelectPage(0);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadCsvTemplate = () => {
    const template = [
      'Student Name,Father Name,Relation,Serial No,Character',
      'DEBASIS CHANDRA PATRA,HARIHAR PATRA,S/o,,good',
      'PRIYANKA KUMARI BISWAL,SANTOSH BISWAL,D/o,,very good',
      'SURAJ KUMAR NAYAK,JAGANNATH NAYAK,S/o,,good',
      'ANITA RANI MAJHI,DAMODAR MAJHI,D/o,,exemplary',
    ].join('\n');
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conduct-certificate-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewParsedCount = pasteText.trim() ? parseConductBulkText(pasteText).length : 0;

  return (
    <aside className="no-print flex w-full shrink-0 flex-col border-b border-blue-200/80 bg-[#f7faff] lg:w-[460px] lg:border-r lg:border-b-0 xl:w-[490px] dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-blue-200/80 bg-gradient-to-br from-[#e9f1ff] via-[#f2f6ff] to-[#fdf8eb] px-5 py-4 dark:border-slate-800 dark:bg-slate-950 dark:bg-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-[#162b5a] dark:text-slate-100">
              Conduct-cum-Character
            </h1>
            <p className="font-mono-tabular mt-0.5 text-xs text-[#4a5e82] dark:text-slate-400">
              {batch.students.length} students · {pageCount} A4{' '}
              {pageCount === 1 ? 'page' : 'pages'} (2 different copies/page)
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveBatchToRegistry}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1c3570] px-3 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#142754] dark:border dark:border-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:shadow-none dark:hover:bg-white"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save All</span>
          </button>
        </div>

        {/* Single vs Bulk 2-Up Switcher */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-blue-200/70 bg-[#dfe9fa] p-1 dark:border-transparent dark:bg-slate-900">
          <button
            type="button"
            onClick={onSwitchToSingle}
            className="h-8 cursor-pointer whitespace-nowrap rounded-md px-2 text-xs font-medium text-[#2c4478] transition-colors hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200"
          >
            Single Entry
          </button>
          <button
            type="button"
            className="h-8 cursor-pointer whitespace-nowrap rounded-md bg-[#1c3570] px-2 text-xs font-semibold text-white shadow-xs dark:bg-slate-800 dark:text-white"
          >
            Bulk Entry (2 / Page)
          </button>
        </div>

        {/* Bulk Utility Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPasteOpen((prev) => !prev)}
            className={`inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-medium transition-colors ${
              pasteOpen
                ? 'border-[#1c3570] bg-[#1c3570] text-white shadow-xs dark:border-sky-500 dark:bg-sky-600'
                : 'border-blue-200/90 bg-white text-[#1c3570] hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span>Paste Excel / CSV</span>
          </button>

          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={handleCsvUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-200/90 bg-white px-2.5 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={onLoadDemoBatch}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-teal-200 bg-teal-50/80 px-2.5 text-xs font-medium text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100/80 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-700 dark:text-slate-300" />
            <span>4-Student Demo</span>
          </button>

          <button
            type="button"
            onClick={onClearBatch}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-rose-200/90 bg-white px-2.5 text-xs font-medium text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-red-900/60 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <Eraser className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {/* Paste from Excel / CSV Drawer */}
        {pasteOpen && (
          <div className="rounded-lg border border-blue-200 bg-[#edf3ff]/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#162b5a] dark:text-slate-100">
                Paste rows from Excel, Sheets, or CSV
              </span>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#1d4ed8] hover:underline dark:text-sky-400"
              >
                <Download className="h-3 w-3" />
                Sample CSV
              </button>
            </div>
            <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
              Columns: <strong className="font-medium text-slate-700 dark:text-slate-300">Student Name, Father Name, S/o or D/o</strong> (optional: Serial No, Character). One student per line.
            </p>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`DEBASIS CHANDRA PATRA, HARIHAR PATRA, S/o\nPRIYANKA KUMARI BISWAL, SANTOSH BISWAL, D/o`}
              className="font-mono-tabular w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#1c2f5e] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400"
            />
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-tabular text-[11px] text-slate-500 dark:text-slate-400">
                {previewParsedCount > 0
                  ? `${previewParsedCount} student${previewParsedCount === 1 ? '' : 's'} detected`
                  : 'Paste lines above to import'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={previewParsedCount === 0}
                  onClick={() => handleApplyPaste(false)}
                  className="h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Append
                </button>
                <button
                  type="button"
                  disabled={previewParsedCount === 0}
                  onClick={() => handleApplyPaste(true)}
                  className="h-8 cursor-pointer rounded-md bg-[#1c2f5e] px-3 text-xs font-medium text-white hover:bg-[#15244a] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
                >
                  Replace List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shared Batch Defaults (Collapsible) */}
        <div className="border-b border-blue-100 pb-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSettingsOpen((prev) => !prev)}
            className="flex w-full cursor-pointer items-center justify-between text-left"
          >
            <div>
              <h2 className="font-display text-sm font-semibold text-[#162b5a] dark:text-slate-100">
                Common Batch Details
              </h2>
              <p className="text-[11px] text-[#4a5e82] dark:text-slate-400">
                Applied automatically to all {batch.students.length} certificates
              </p>
            </div>
            {settingsOpen ? (
              <ChevronUp className="h-4 w-4 text-[#2c4478] dark:text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#2c4478] dark:text-slate-500" />
            )}
          </button>

          {settingsOpen && (
            <div className="mt-3.5 space-y-3">
              <div className="grid grid-cols-[1fr_84px] gap-2.5">
                <div>
                  <label htmlFor="cb-prefix" className={LABEL_CLASS}>
                    Auto serial prefix
                  </label>
                  <input
                    id="cb-prefix"
                    type="text"
                    value={batch.serialPrefix}
                    onChange={(e) => patchBatch({ serialPrefix: e.target.value })}
                    placeholder="UGHS/CC/2024/"
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label htmlFor="cb-start" className={LABEL_CLASS}>
                    Start no.
                  </label>
                  <input
                    id="cb-start"
                    type="number"
                    min={1}
                    value={batch.startNumber}
                    onChange={(e) =>
                      patchBatch({ startNumber: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor="cb-dated"
                      className="text-[11px] font-medium text-slate-600 dark:text-slate-400"
                    >
                      Common Dated
                    </label>
                    <button
                      type="button"
                      onClick={() => patchBatch({ dated: getTodayIso() })}
                      className="inline-flex cursor-pointer items-center gap-0.5 text-[11px] font-medium text-[#1c2f5e] hover:underline dark:text-sky-400"
                    >
                      <Calendar className="h-3 w-3" />
                      Today
                    </button>
                  </div>
                  <input
                    id="cb-dated"
                    type="date"
                    value={batch.dated}
                    onChange={(e) => patchBatch({ dated: e.target.value })}
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>

                <div>
                  <label htmlFor="cb-char" className={LABEL_CLASS}>
                    Default character
                  </label>
                  <select
                    id="cb-char"
                    value={batch.characterRating}
                    onChange={(e) => patchBatch({ characterRating: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    <option value="good">Good</option>
                    <option value="very good">Very Good</option>
                    <option value="exemplary">Exemplary</option>
                    <option value="satisfactory">Satisfactory</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="cb-basis" className={LABEL_CLASS}>
                  Examination / Issuance basis
                </label>
                <input
                  id="cb-basis"
                  type="text"
                  value={batch.examBasis}
                  onChange={(e) => patchBatch({ examBasis: e.target.value })}
                  placeholder="Passed in AHSC Exam. - 2024"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cb-from" className={LABEL_CLASS}>
                    Session from
                  </label>
                  <input
                    id="cb-from"
                    type="text"
                    value={batch.sessionFrom}
                    onChange={(e) => patchBatch({ sessionFrom: e.target.value })}
                    placeholder="2021-22"
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>
                <div>
                  <label htmlFor="cb-to" className={LABEL_CLASS}>
                    Session to
                  </label>
                  <input
                    id="cb-to"
                    type="text"
                    value={batch.sessionTo}
                    onChange={(e) => patchBatch({ sessionTo: e.target.value })}
                    placeholder="2023-24"
                    className={`${INPUT_CLASS} font-mono-tabular`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-slate-700 dark:text-slate-300">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={batch.showCutLine}
                    onChange={(e) => patchBatch({ showCutLine: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 accent-[#1c2f5e]"
                  />
                  <span>Show middle cut line</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={batch.fillOddBlank}
                    onChange={(e) => patchBatch({ fillOddBlank: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 accent-[#1c2f5e]"
                  />
                  <span>Blank 2nd copy if odd count</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Student List (Paired 2 per A4 Page) */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-semibold text-[#162b5a] dark:text-slate-100">
                Students List
              </h2>
              <p className="text-[11px] text-[#4a5e82] dark:text-slate-400">
                Paired sequentially: #1 &amp; #2 on Page 1, #3 &amp; #4 on Page 2
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddStudent}
              className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg bg-[#1c3570] px-3 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#142754] dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Student</span>
            </button>
          </div>

          <div className="space-y-3">
            {batch.students.map((student, idx) => {
              const pageNum = Math.floor(idx / 2) + 1;
              const slotLabel = idx % 2 === 0 ? 'Top Half' : 'Bottom Half';
              const isOnActivePage = Math.floor(idx / 2) === activePageIndex;
              const autoSerial = batch.serialPrefix.trim()
                ? `${batch.serialPrefix}${String(batch.startNumber + idx).padStart(3, '0')}`
                : String(batch.startNumber + idx).padStart(3, '0');

              return (
                <div
                  key={student.id}
                  onFocus={() => {
                    const targetPage = Math.floor(idx / 2);
                    if (targetPage !== activePageIndex) onSelectPage(targetPage);
                  }}
                  className={`rounded-lg border p-3 transition-colors ${
                    isOnActivePage
                      ? 'border-blue-300 bg-[#edf3ff]/90 dark:border-sky-500/45 dark:bg-slate-900/80'
                      : 'border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  {/* Row header */}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPage(Math.floor(idx / 2))}
                      className="font-mono-tabular cursor-pointer text-[11px] font-semibold text-[#1c3570] hover:underline dark:text-slate-400 dark:hover:text-sky-400"
                    >
                      #{idx + 1} · Page {pageNum} ({slotLabel})
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStudent(idx, -1)}
                        title="Move up"
                        aria-label={`Move student ${idx + 1} up`}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === batch.students.length - 1}
                        onClick={() => handleMoveStudent(idx, 1)}
                        title="Move down"
                        aria-label={`Move student ${idx + 1} down`}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateStudent(student, idx)}
                        title="Duplicate row"
                        aria-label={`Duplicate student ${idx + 1}`}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        title="Remove student"
                        aria-label={`Remove student ${idx + 1}`}
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Row inputs */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_82px] gap-2">
                      <input
                        type="text"
                        aria-label={`Student ${idx + 1} name`}
                        value={student.name}
                        onChange={(e) => updateStudent(student.id, { name: e.target.value })}
                        placeholder="Student full name"
                        className={INPUT_CLASS}
                      />
                      <select
                        aria-label={`Student ${idx + 1} relation`}
                        value={student.rel}
                        onChange={(e) =>
                          handleRelationChange(student.id, e.target.value as ConductRelationOption)
                        }
                        className={INPUT_CLASS}
                      >
                        <option value="S/o">S/o</option>
                        <option value="D/o">D/o</option>
                        <option value="S/o / D/o">S/o / D/o</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-[1fr_118px] gap-2">
                      <input
                        type="text"
                        aria-label={`Student ${idx + 1} father name`}
                        value={student.father}
                        onChange={(e) => updateStudent(student.id, { father: e.target.value })}
                        placeholder="Father's name (Sri)"
                        className={INPUT_CLASS}
                      />
                      <input
                        type="text"
                        aria-label={`Student ${idx + 1} serial number override`}
                        value={student.serialNo}
                        onChange={(e) => updateStudent(student.id, { serialNo: e.target.value })}
                        placeholder={autoSerial}
                        title="Leave blank to use automatic serial number"
                        className={`${INPUT_CLASS} font-mono-tabular`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddStudent}
            className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 text-xs font-semibold text-[#1c3570] transition-colors hover:border-[#1c3570] hover:bg-blue-100/70 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Another Student ({batch.students.length + 1})</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
