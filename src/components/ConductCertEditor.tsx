import {
  ArrowDownToLine,
  Calendar,
  Eraser,
  Save,
  Sparkles,
} from 'lucide-react';
import {
  ConductCertData,
  ConductRelationOption,
  PronounOption,
  SheetOrientation,
  getTodayIso,
} from '../types/documents';

interface ConductCertEditorProps {
  data: ConductCertData;
  onChange: (next: ConductCertData) => void;
  onSaveToRegistry: () => void;
  onCopyFromStudyCert: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  editingRecordId: string | null;
  onSwitchToBulk: () => void;
}

const INPUT_CLASS =
  'h-10 w-full rounded-lg border border-blue-200/90 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-0';

const LABEL_CLASS =
  'mb-1.5 block text-xs font-medium text-[#3b4f74] dark:text-slate-400';

const EXAM_PRESETS = [
  'Passed in AHSC Exam. - 2024',
  'Passed in AHSC Exam. - 2025',
  'Completed Class VIII Annual Exam.',
  'Completed Schooling at this Institution',
];

export function ConductCertEditor({
  data,
  onChange,
  onSaveToRegistry,
  onCopyFromStudyCert,
  onLoadSample,
  onClear,
  editingRecordId,
  onSwitchToBulk,
}: ConductCertEditorProps) {
  const patch = (partial: Partial<ConductCertData>) => {
    onChange({ ...data, ...partial });
  };

  const handleRelationChange = (rel: ConductRelationOption) => {
    let nextPro: PronounOption = data.pro;
    if (rel === 'S/o') nextPro = 'His';
    else if (rel === 'D/o') nextPro = 'Her';
    else nextPro = '';
    patch({ rel, pro: nextPro });
  };

  return (
    <aside className="no-print flex w-full shrink-0 flex-col border-b border-blue-200/80 bg-[#f7faff] lg:w-[420px] lg:border-r lg:border-b-0 xl:w-[440px] dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-blue-200/80 bg-gradient-to-br from-[#e9f1ff] via-[#f2f6ff] to-[#fdf8eb] px-5 py-4 dark:border-slate-800 dark:bg-slate-950 dark:bg-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-[#162b5a] dark:text-slate-100">
              Conduct-cum-Character
            </h1>
            <p className="mt-0.5 text-xs text-[#4a5e82] dark:text-slate-400">
              {editingRecordId
                ? 'Editing saved registry record · Auto-saved to draft'
                : 'Single certificate or bulk 2-per-A4 batch'}
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

        {/* Single vs Bulk 2-Up Entry Switcher */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-blue-200/70 bg-[#dfe9fa] p-1 dark:border-transparent dark:bg-slate-900">
          <button
            type="button"
            className="h-8 cursor-pointer whitespace-nowrap rounded-md bg-[#1c3570] px-2 text-xs font-semibold text-white shadow-xs dark:bg-slate-800 dark:text-white"
          >
            Single Entry
          </button>
          <button
            type="button"
            onClick={onSwitchToBulk}
            className="h-8 cursor-pointer whitespace-nowrap rounded-md px-2 text-xs font-medium text-[#2c4478] transition-colors hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200"
          >
            Bulk Entry (2 / Page)
          </button>
        </div>

        {/* Page Orientation Switcher */}
        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-[#3b4f74] dark:text-slate-400">Page layout:</span>
          <div className="inline-flex rounded-md border border-blue-200/80 bg-[#e6effd] p-0.5 dark:border-slate-800 dark:bg-slate-900">
            {(
              [
                { id: 'landscape', label: 'A4 Landscape' },
                { id: 'portrait', label: 'A4 Portrait' },
              ] as { id: SheetOrientation; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => patch({ orientation: item.id })}
                className={`h-7 cursor-pointer whitespace-nowrap rounded px-2.5 text-xs font-medium transition-colors ${
                  data.orientation === item.id
                    ? 'bg-[#1c3570] text-white shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-[#2c4478] hover:text-[#142754] dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Utility row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyFromStudyCert}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-200/90 bg-white px-2.5 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Sync from Study Cert</span>
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

      {/* Form Content */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Section 1: Reference & Issuance Basis */}
        <div>
          <h2 className="font-display mb-3 text-sm font-semibold text-[#162b5a] dark:text-slate-100">
            Certificate Reference
          </h2>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-serial" className={LABEL_CLASS}>
                  Serial No.
                </label>
                <input
                  id="cc-serial"
                  type="text"
                  value={data.serialNo}
                  onChange={(e) => patch({ serialNo: e.target.value })}
                  placeholder="e.g. UGHS/CC/2024/042"
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="cc-dated"
                    className="text-xs font-medium text-[#3b4f74] dark:text-slate-400"
                  >
                    Dated
                  </label>
                  <button
                    type="button"
                    onClick={() => patch({ dated: getTodayIso() })}
                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#1d4ed8] hover:underline dark:text-sky-400"
                  >
                    <Calendar className="h-3 w-3" />
                    Today
                  </button>
                </div>
                <input
                  id="cc-dated"
                  type="date"
                  value={data.dated}
                  onChange={(e) => patch({ dated: e.target.value })}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cc-basis" className={LABEL_CLASS}>
                Examination / Issuance basis
              </label>
              <input
                id="cc-basis"
                type="text"
                value={data.examBasis}
                onChange={(e) => patch({ examBasis: e.target.value })}
                placeholder="Passed in AHSC Exam. - 2024"
                className={INPUT_CLASS}
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#4a5e82] dark:text-slate-400">
                <span>Presets:</span>
                {EXAM_PRESETS.map((preset, idx) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => patch({ examBasis: preset })}
                    className="cursor-pointer font-semibold text-[#1d4ed8] hover:underline dark:text-sky-400"
                  >
                    {idx === 0 ? 'AHSC 2024' : idx === 1 ? 'AHSC 2025' : idx === 2 ? 'Class VIII' : 'General'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-blue-100 dark:border-slate-800" />

        {/* Section 2: Student Particulars */}
        <div>
          <h2 className="font-display mb-3 text-sm font-semibold text-[#162b5a] dark:text-slate-100">
            Student Particulars
          </h2>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="cc-name" className={LABEL_CLASS}>
                Student full name
              </label>
              <input
                id="cc-name"
                type="text"
                value={data.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Debasis Chandra Patra"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-rel" className={LABEL_CLASS}>
                  Relation
                </label>
                <select
                  id="cc-rel"
                  value={data.rel}
                  onChange={(e) => handleRelationChange(e.target.value as ConductRelationOption)}
                  className={INPUT_CLASS}
                >
                  <option value="S/o / D/o">S/o / D/o (as is)</option>
                  <option value="S/o">S/o (Son of)</option>
                  <option value="D/o">D/o (Daughter of)</option>
                </select>
              </div>
              <div>
                <label htmlFor="cc-pro" className={LABEL_CLASS}>
                  Pronoun
                </label>
                <select
                  id="cc-pro"
                  value={data.pro}
                  onChange={(e) => patch({ pro: e.target.value as PronounOption })}
                  className={INPUT_CLASS}
                >
                  <option value="">As is (His/Her, He/She)</option>
                  <option value="His">His / He</option>
                  <option value="Her">Her / She</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cc-father" className={LABEL_CLASS}>
                Father&apos;s name (Sri)
              </label>
              <input
                id="cc-father"
                type="text"
                value={data.father}
                onChange={(e) => patch({ father: e.target.value })}
                placeholder="e.g. Harihar Patra"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-from" className={LABEL_CLASS}>
                  Session from
                </label>
                <input
                  id="cc-from"
                  type="text"
                  value={data.sessionFrom}
                  onChange={(e) => patch({ sessionFrom: e.target.value })}
                  placeholder="e.g. 2021-22"
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
              <div>
                <label htmlFor="cc-to" className={LABEL_CLASS}>
                  Session to
                </label>
                <input
                  id="cc-to"
                  type="text"
                  value={data.sessionTo}
                  onChange={(e) => patch({ sessionTo: e.target.value })}
                  placeholder="e.g. 2023-24"
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-blue-100 dark:border-slate-800" />

        {/* Section 3: Character & Closing Remark */}
        <div>
          <h2 className="font-display mb-3 text-sm font-semibold text-[#162b5a] dark:text-slate-100">
            Character &amp; Remarks
          </h2>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="cc-char" className={LABEL_CLASS}>
                Moral character rating
              </label>
              <select
                id="cc-char"
                value={data.characterRating}
                onChange={(e) => patch({ characterRating: e.target.value })}
                className={INPUT_CLASS}
              >
                <option value="good">Good</option>
                <option value="very good">Very Good</option>
                <option value="exemplary">Exemplary</option>
                <option value="satisfactory">Satisfactory</option>
              </select>
            </div>

            <div>
              <label htmlFor="cc-wish" className={LABEL_CLASS}>
                Closing wish line (optional)
              </label>
              <textarea
                id="cc-wish"
                rows={2}
                value={data.closingWish}
                onChange={(e) => patch({ closingWish: e.target.value })}
                placeholder="Leave blank to omit closing paragraph"
                className="w-full rounded-lg border border-blue-200/90 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
