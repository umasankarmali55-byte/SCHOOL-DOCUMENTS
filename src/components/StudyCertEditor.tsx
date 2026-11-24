import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  Calendar,
  Eraser,
  ImagePlus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  PronounOption,
  RelationOption,
  StudyCertData,
  getTodayIso,
} from '../types/documents';

interface StudyCertEditorProps {
  data: StudyCertData;
  onChange: (next: StudyCertData) => void;
  onSaveToRegistry: () => void;
  onCopyFromMarkSheet: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  editingRecordId: string | null;
}

const INPUT_CLASS =
  'h-10 w-full rounded-lg border border-blue-200/90 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#1c3570] focus:ring-2 focus:ring-blue-500/15 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400 dark:focus:bg-slate-950 dark:focus:ring-0';

const LABEL_CLASS =
  'mb-1.5 block text-xs font-medium text-[#3b4f74] dark:text-slate-400';

export function StudyCertEditor({
  data,
  onChange,
  onSaveToRegistry,
  onCopyFromMarkSheet,
  onLoadSample,
  onClear,
  editingRecordId,
}: StudyCertEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const patch = (partial: Partial<StudyCertData>) => {
    onChange({ ...data, ...partial });
  };

  const handleRelationChange = (rel: RelationOption) => {
    let nextPro: PronounOption = data.pro;
    if (rel === 'Son') nextPro = 'His';
    else if (rel === 'Daughter') nextPro = 'Her';
    else nextPro = '';
    patch({ rel, pro: nextPro });
  };

  const readImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        patch({ photoDataUrl: reader.result, photoZoom: 1, photoPosY: 50 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readImageFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readImageFile(file);
  };

  return (
    <aside className="no-print flex w-full shrink-0 flex-col border-b border-blue-200/80 bg-[#f7faff] lg:w-[420px] lg:border-r lg:border-b-0 xl:w-[440px] dark:border-slate-800 dark:bg-slate-950">
      {/* Editor Header */}
      <div className="border-b border-blue-200/80 bg-gradient-to-br from-[#e9f1ff] via-[#f2f6ff] to-[#fdf8eb] px-5 py-4 dark:border-slate-800 dark:bg-slate-950 dark:bg-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-[#162b5a] dark:text-slate-100">
              Study Certificate
            </h1>
            <p className="mt-0.5 text-xs text-[#4a5e82] dark:text-slate-400">
              {editingRecordId
                ? 'Editing saved registry record · Changes auto-save to draft'
                : 'Fill student particulars from the School Admission Register'}
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

        {/* Utility row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopyFromMarkSheet}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-200/90 bg-white px-2.5 text-xs font-medium text-[#1c3570] transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span>Sync from Mark Sheet</span>
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

      {/* Scrollable Form Content */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Section 1: Student Identity */}
        <div>
          <h2 className="font-display mb-3 text-sm font-semibold text-[#162b5a] dark:text-slate-100">
            Student Particulars
          </h2>
          <div className="space-y-3.5">
            <div>
              <label htmlFor="sc-serial" className={LABEL_CLASS}>
                Ref. / Serial No. (optional)
              </label>
              <input
                id="sc-serial"
                type="text"
                value={data.serialNo}
                onChange={(e) => patch({ serialNo: e.target.value })}
                placeholder="e.g. UGHS/SC/2025/018"
                className={`${INPUT_CLASS} font-mono-tabular`}
              />
            </div>

            <div>
              <label htmlFor="sc-name" className={LABEL_CLASS}>
                Student full name
              </label>
              <input
                id="sc-name"
                type="text"
                value={data.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Subham Kumar Majhi"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sc-rel" className={LABEL_CLASS}>
                  Relation
                </label>
                <select
                  id="sc-rel"
                  value={data.rel}
                  onChange={(e) => handleRelationChange(e.target.value as RelationOption)}
                  className={INPUT_CLASS}
                >
                  <option value="Son/Daughter">Son/Daughter (as is)</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                </select>
              </div>
              <div>
                <label htmlFor="sc-pro" className={LABEL_CLASS}>
                  Pronoun
                </label>
                <select
                  id="sc-pro"
                  value={data.pro}
                  onChange={(e) => patch({ pro: e.target.value as PronounOption })}
                  className={INPUT_CLASS}
                >
                  <option value="">As is (His/her)</option>
                  <option value="His">His</option>
                  <option value="Her">Her</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="sc-father" className={LABEL_CLASS}>
                Father&apos;s name (Sri)
              </label>
              <input
                id="sc-father"
                type="text"
                value={data.father}
                onChange={(e) => patch({ father: e.target.value })}
                placeholder="e.g. Ramesh Chandra Majhi"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="sc-mother" className={LABEL_CLASS}>
                Mother&apos;s name (Smt.)
              </label>
              <input
                id="sc-mother"
                type="text"
                value={data.mother}
                onChange={(e) => patch({ mother: e.target.value })}
                placeholder="e.g. Sabita Majhi"
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sc-dob" className={LABEL_CLASS}>
                  Date of birth
                </label>
                <input
                  id="sc-dob"
                  type="date"
                  value={data.dob}
                  onChange={(e) => patch({ dob: e.target.value })}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
              <div>
                <label htmlFor="sc-cls" className={LABEL_CLASS}>
                  Class studied
                </label>
                <input
                  id="sc-cls"
                  type="text"
                  value={data.cls}
                  onChange={(e) => patch({ cls: e.target.value })}
                  placeholder="e.g. VIII"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-blue-100 dark:border-slate-800" />

        {/* Section 2: Admission Register & Issuance */}
        <div>
          <h2 className="font-display mb-3 text-sm font-semibold text-[#162b5a] dark:text-slate-100">
            Admission Register &amp; Issuance
          </h2>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sc-ses" className={LABEL_CLASS}>
                  Education session
                </label>
                <input
                  id="sc-ses"
                  type="text"
                  value={data.ses}
                  onChange={(e) => patch({ ses: e.target.value })}
                  placeholder="2024/2025"
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="sc-issue" className="text-xs font-medium text-[#3b4f74] dark:text-slate-400">
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
                  id="sc-issue"
                  type="date"
                  value={data.issue}
                  onChange={(e) => patch({ issue: e.target.value })}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sc-eno" className={LABEL_CLASS}>
                  Enrolment / ID no.
                </label>
                <input
                  id="sc-eno"
                  type="text"
                  value={data.eno}
                  onChange={(e) => patch({ eno: e.target.value })}
                  placeholder="e.g. MLD-2021-048"
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
              <div>
                <label htmlFor="sc-adm" className={LABEL_CLASS}>
                  Admission date
                </label>
                <input
                  id="sc-adm"
                  type="date"
                  value={data.adm}
                  onChange={(e) => patch({ adm: e.target.value })}
                  className={`${INPUT_CLASS} font-mono-tabular`}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-blue-100 dark:border-slate-800" />

        {/* Section 3: Student Passport Photo */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-[#162b5a] dark:text-slate-100">
              Passport Photo (Optional)
            </h2>
            {data.photoDataUrl && (
              <button
                type="button"
                onClick={() => patch({ photoDataUrl: '', photoZoom: 1, photoPosY: 50 })}
                className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove photo
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3.5 transition-colors ${
              isDragging
                ? 'border-[#1c3570] bg-blue-100/70 dark:border-sky-400 dark:bg-sky-950/30'
                : 'border-blue-300 bg-blue-50/50 hover:border-[#1c3570] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600'
            }`}
          >
            {data.photoDataUrl ? (
              <div className="h-14 w-13 shrink-0 overflow-hidden rounded border border-blue-200 bg-white dark:border-slate-700">
                <img
                  src={data.photoDataUrl}
                  alt="Uploaded student portrait preview"
                  className="h-full w-full object-cover"
                  style={{
                    transform: `scale(${data.photoZoom || 1})`,
                    objectPosition: `50% ${data.photoPosY ?? 50}%`,
                  }}
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-[#1c3570] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <ImagePlus className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#162b5a] dark:text-slate-200">
                {data.photoDataUrl ? 'Click or drop to replace photo' : 'Upload passport photo'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#4a5e82] dark:text-slate-400">
                29 × 30 mm box · Leave empty to print &ldquo;PASTE PHOTO&rdquo;
              </p>
            </div>
          </div>

          {data.photoDataUrl && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Photo zoom</span>
                  <span className="font-mono-tabular">{Math.round((data.photoZoom || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={1.8}
                  step={0.05}
                  value={data.photoZoom || 1}
                  onChange={(e) => patch({ photoZoom: Number(e.target.value) })}
                  className="w-full accent-[#1c2f5e] dark:accent-sky-400"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Vertical crop</span>
                  <span className="font-mono-tabular">{data.photoPosY ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={2}
                  value={data.photoPosY ?? 50}
                  onChange={(e) => patch({ photoPosY: Number(e.target.value) })}
                  className="w-full accent-[#1c2f5e] dark:accent-sky-400"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
