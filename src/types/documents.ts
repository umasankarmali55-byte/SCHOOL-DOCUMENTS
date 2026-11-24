export type ActiveView =
  | 'cert'
  | 'conduct'
  | 'ms-primary'
  | 'ms-upper'
  | 'ms-secondary'
  | 'registry';

export type MarkSheetKind = 'p' | 'u' | 's';
export type MarkSheetFormatVersion = 'current' | 'legacy';

export type RelationOption = 'Son/Daughter' | 'Son' | 'Daughter';
export type ConductRelationOption = 'S/o / D/o' | 'S/o' | 'D/o';
export type PronounOption = '' | 'His' | 'Her';
export type SheetOrientation = 'portrait' | 'landscape';

export interface SchoolConfig {
  officeTitle: string;
  schoolName: string;
  addressLine: string;
  email: string;
  bseCode: string;
  udiseCode: string;
  placeLabel: string;
  bodySchoolName: string;
  watermarkTop: string;
  watermarkBottom: string;
}

export interface StudyCertData {
  serialNo: string;
  name: string;
  rel: RelationOption;
  pro: PronounOption;
  father: string;
  mother: string;
  dob: string;
  cls: string;
  ses: string;
  issue: string;
  eno: string;
  adm: string;
  photoDataUrl: string;
  photoZoom: number;
  photoPosY: number;
}

export interface ConductCertData {
  serialNo: string;
  dated: string;
  examBasis: string;
  name: string;
  rel: ConductRelationOption;
  pro: PronounOption;
  father: string;
  sessionFrom: string;
  sessionTo: string;
  characterRating: string;
  closingWish: string;
  orientation: SheetOrientation;
}

export interface ConductBulkStudent {
  id: string;
  serialNo: string; // optional override; auto-numbered if blank
  name: string;
  father: string;
  rel: ConductRelationOption;
  pro: PronounOption;
  characterRating: string; // optional override; uses batch default if blank
}

export interface ConductBulkBatch {
  serialPrefix: string;
  startNumber: number;
  dated: string;
  examBasis: string;
  sessionFrom: string;
  sessionTo: string;
  characterRating: string;
  closingWish: string;
  showCutLine: boolean;
  fillOddBlank: boolean;
  students: ConductBulkStudent[];
}

export interface MarkRowValue {
  id?: string; // Stable row key for adding/deleting/editing subjects
  subject?: string; // Editable subject name
  fullMarks?: string; // Editable Full Marks per subject (per term for Term 1 & 2)
  col1: string; // T-1 (for current p/u) or Secured Marks (for s & legacy p/u)
  col2: string; // T-2 (for current p/u) or Remarks (for s & legacy p/u)
}

export interface MarkSheetData {
  type: MarkSheetKind;
  formatVersion?: MarkSheetFormatVersion;
  name: string;
  father: string;
  mother: string;
  dob: string;
  ses: string;
  reg: string;
  roll: string;
  cls: string;
  issue: string;
  marks: Record<MarkSheetKind, MarkRowValue[]>;
  legacyMarks?: Record<'p' | 'u', MarkRowValue[]>;
}

export interface RegistryRecord {
  id: string;
  kind: 'cert' | 'conduct' | MarkSheetKind;
  studentName: string;
  fatherName: string;
  cls: string;
  session: string;
  identifier: string; // Serial No., Enrolment ID, or Roll/Reg No.
  issueDate: string;
  updatedAt: string;
  certData?: StudyCertData;
  conductData?: ConductCertData;
  markSheetData?: MarkSheetData;
}

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  officeTitle: 'THE OFFICE OF THE HEADMASTER',
  schoolName: 'GOVERNMENT UPGRADED HIGH SCHOOL, MALDA',
  addressLine: 'AT/PO-MALDA, BLOCK-BORIGUMMA, DIST-KORAPUT, PIN-764056',
  email: 'ughschoolmalda123@gmail.com',
  bseCode: '216FA',
  udiseCode: '21290310201',
  placeLabel: 'Govt. U.G.H.S. Malda',
  bodySchoolName: 'Govt. Upgraded High School, Malda',
  watermarkTop: 'GOVT. U.G. HIGH SCHOOL',
  watermarkBottom: 'MALDA · BORIGUMMA',
};

export const MARK_SHEET_SUBJECTS: Record<MarkSheetKind, string[]> = {
  p: [
    'ODIA',
    'ENGLISH',
    'MATHEMATICS',
    'SCIENCE',
    'SOCIAL SCIENCE',
    'ARTS EDUCATION',
    'PHYSICAL EDUCATION',
  ],
  u: [
    'ODIA',
    'ENGLISH',
    'MATHEMATICS',
    'SCIENCE',
    'SOCIAL SCIENCE',
    'HINDI/SANSKRIT',
    'ART EDUCATION',
    'PHYSICAL EDUCATION',
    'WORK EDUCATION',
  ],
  s: [
    'ODIA',
    'ENGLISH',
    'HINDI/SANSKRIT',
    'MATHEMATICS',
    'GENERAL SCIENCE',
    'SOCIAL SCIENCE',
  ],
};

export const MARK_SHEET_LABELS: Record<
  MarkSheetKind,
  { short: string; full: string; maxTotal: number; subjectCount: number }
> = {
  p: {
    short: 'Primary',
    full: 'Primary Class (7 Subjects · 1400)',
    maxTotal: 1400,
    subjectCount: 7,
  },
  u: {
    short: 'Upper Primary',
    full: 'Upper Primary Class (9 Subjects · 1800)',
    maxTotal: 1800,
    subjectCount: 9,
  },
  s: {
    short: 'Secondary',
    full: 'Secondary Class (6 Subjects · 600)',
    maxTotal: 600,
    subjectCount: 6,
  },
};

export const LEGACY_MARK_SHEET_SUBJECTS: Record<'p' | 'u', string[]> = {
  p: ['ODIA', 'ENGLISH', 'MATH', 'SOCIAL SCIENCE', 'DRAWING'],
  u: [
    'ODIA',
    'ENGLISH',
    'MATH',
    'SCIENCE',
    'HISTORY',
    'GEOGRAPHY',
    'HINDI',
    'SANSKRIT',
    'DRAWING',
  ],
};

export function createDefaultCurrentRows(kind: MarkSheetKind): MarkRowValue[] {
  return MARK_SHEET_SUBJECTS[kind].map((subject, idx) => ({
    id: `${kind}-def-${idx}`,
    subject,
    fullMarks: '100',
    col1: '',
    col2: '',
  }));
}

export function createDefaultLegacyRows(kind: 'p' | 'u'): MarkRowValue[] {
  return LEGACY_MARK_SHEET_SUBJECTS[kind].map((subject, idx) => ({
    id: `${kind}-old-${idx}`,
    subject,
    fullMarks: '',
    col1: '',
    col2: '',
  }));
}

export function createEmptyMarks(): Record<MarkSheetKind, MarkRowValue[]> {
  return {
    p: createDefaultCurrentRows('p'),
    u: createDefaultCurrentRows('u'),
    s: createDefaultCurrentRows('s'),
  };
}

export function createEmptyLegacyMarks(): Record<'p' | 'u', MarkRowValue[]> {
  return {
    p: createDefaultLegacyRows('p'),
    u: createDefaultLegacyRows('u'),
  };
}

export function isLegacyMarkSheet(data: MarkSheetData): boolean {
  return (data.type === 'p' || data.type === 'u') && data.formatVersion === 'legacy';
}

export function getActiveMarkRows(data: MarkSheetData): MarkRowValue[] {
  if (isLegacyMarkSheet(data) && (data.type === 'p' || data.type === 'u')) {
    const legacyKind = data.type;
    const raw = data.legacyMarks?.[legacyKind];
    if (!raw || raw.length === 0) return createDefaultLegacyRows(legacyKind);
    return raw.map((row, idx) => ({
      id: row.id ?? `${legacyKind}-old-${idx}`,
      subject:
        row.subject !== undefined
          ? row.subject
          : (LEGACY_MARK_SHEET_SUBJECTS[legacyKind][idx] ?? ''),
      fullMarks: row.fullMarks ?? '',
      col1: row.col1 ?? '',
      col2: row.col2 ?? '',
    }));
  }

  const kind = data.type;
  const raw = data.marks?.[kind];
  if (!raw || raw.length === 0) return createDefaultCurrentRows(kind);
  return raw.map((row, idx) => ({
    id: row.id ?? `${kind}-cur-${idx}`,
    subject:
      row.subject !== undefined
        ? row.subject
        : (MARK_SHEET_SUBJECTS[kind][idx] ?? ''),
    fullMarks: row.fullMarks !== undefined ? row.fullMarks : '100',
    col1: row.col1 ?? '',
    col2: row.col2 ?? '',
  }));
}

export function createDefaultStudyCert(): StudyCertData {
  return {
    serialNo: '',
    name: '',
    rel: 'Son/Daughter',
    pro: '',
    father: '',
    mother: '',
    dob: '',
    cls: '',
    ses: '2024/2025',
    issue: '',
    eno: '',
    adm: '',
    photoDataUrl: '',
    photoZoom: 1,
    photoPosY: 50,
  };
}

export function createDefaultConductCert(): ConductCertData {
  return {
    serialNo: '',
    dated: '',
    examBasis: 'Passed in AHSC Exam. - 2024',
    name: '',
    rel: 'S/o / D/o',
    pro: '',
    father: '',
    sessionFrom: '',
    sessionTo: '',
    characterRating: 'good',
    closingWish: 'We wish all success in future academic and personal endeavours.',
    orientation: 'landscape',
  };
}

export function createDefaultMarkSheet(
  type: MarkSheetKind = 'p',
  formatVersion: MarkSheetFormatVersion = 'current'
): MarkSheetData {
  return {
    type,
    formatVersion,
    name: '',
    father: '',
    mother: '',
    dob: '',
    ses: '2024-25',
    reg: '',
    roll: '',
    cls: '',
    issue: '',
    marks: createEmptyMarks(),
    legacyMarks: createEmptyLegacyMarks(),
  };
}

export function formatSlashDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso;
}

export function formatDashDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : iso;
}

export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function sumMarksColumn(
  rows: MarkRowValue[],
  col: 'col1' | 'col2' | 'fullMarks'
): number | '' {
  let total = 0;
  let hasAny = false;
  for (const row of rows) {
    const raw = (row[col] ?? '').trim();
    if (raw !== '' && !Number.isNaN(Number(raw))) {
      total += Number(raw);
      hasAny = true;
    }
  }
  return hasAny ? total : '';
}

export function computeMarkSheetAnalytics(data: MarkSheetData): {
  securedTotal: number;
  maxTotal: number;
  percentage: number | null;
  grade: string;
  filledCount: number;
  expectedCount: number;
  invalidCount: number;
} {
  const rows = getActiveMarkRows(data);
  const isLegacy = isLegacyMarkSheet(data);
  const isSingleScoreMode = isLegacy || data.type === 's';

  let securedTotal = 0;
  let fullPerTermTotal = 0;
  let hasCustomFull = false;
  let filledCount = 0;
  let invalidCount = 0;

  for (const row of rows) {
    const fmRaw = (row.fullMarks ?? '').trim();
    let rowMax = 100;
    if (fmRaw !== '') {
      const fmNum = Number(fmRaw);
      if (!Number.isNaN(fmNum) && fmNum > 0) {
        fullPerTermTotal += fmNum;
        rowMax = fmNum;
        hasCustomFull = true;
      } else {
        invalidCount += 1;
      }
    }

    const v1 = row.col1.trim();
    if (v1 !== '') {
      const n1 = Number(v1);
      if (!Number.isNaN(n1)) {
        securedTotal += n1;
        filledCount += 1;
        if (n1 < 0 || n1 > rowMax) invalidCount += 1;
      } else {
        invalidCount += 1;
      }
    }

    if (!isSingleScoreMode) {
      const v2 = row.col2.trim();
      if (v2 !== '') {
        const n2 = Number(v2);
        if (!Number.isNaN(n2)) {
          securedTotal += n2;
          filledCount += 1;
          if (n2 < 0 || n2 > rowMax) invalidCount += 1;
        } else {
          invalidCount += 1;
        }
      }
    }
  }

  const perTermMax = hasCustomFull ? fullPerTermTotal : rows.length * 100;
  const maxTotal = isSingleScoreMode ? perTermMax : perTermMax * 2;
  const expectedCount = isSingleScoreMode ? rows.length : rows.length * 2;
  const percentage =
    filledCount > 0 && maxTotal > 0 ? (securedTotal / maxTotal) * 100 : null;

  let grade = '—';
  if (percentage !== null) {
    if (percentage >= 90) grade = 'A1';
    else if (percentage >= 80) grade = 'A2';
    else if (percentage >= 70) grade = 'B1';
    else if (percentage >= 60) grade = 'B2';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    else if (percentage >= 33) grade = 'E';
    else grade = 'F';
  }

  return {
    securedTotal,
    maxTotal,
    percentage,
    grade,
    filledCount,
    expectedCount,
    invalidCount,
  };
}

export function getRemarkForScore(raw: string, fullMarksRaw?: string): string {
  const trimmed = raw.trim();
  if (!trimmed || Number.isNaN(Number(trimmed))) return '';
  const score = Number(trimmed);
  const fullNum = fullMarksRaw && !Number.isNaN(Number(fullMarksRaw)) && Number(fullMarksRaw) > 0
    ? Number(fullMarksRaw)
    : 100;
  const pct = (score / fullNum) * 100;
  if (pct >= 90) return 'EXCELLENT';
  if (pct >= 75) return 'DISTINCTION';
  if (pct >= 60) return 'FIRST DIV';
  if (pct >= 45) return 'SECOND DIV';
  if (pct >= 33) return 'PASS';
  return 'NEEDS IMP.';
}

export function createSampleRegistryRecords(): RegistryRecord[] {
  const sampleCert: StudyCertData = {
    serialNo: 'UGHS/SC/2025/018',
    name: 'SUBHAM KUMAR MAJHI',
    rel: 'Son',
    pro: 'His',
    father: 'RAMESH CHANDRA MAJHI',
    mother: 'SABITA MAJHI',
    dob: '2011-04-14',
    cls: 'VIII',
    ses: '2024/2025',
    issue: '2025-04-18',
    eno: 'MLD-2021-048',
    adm: '2021-06-21',
    photoDataUrl: '',
    photoZoom: 1,
    photoPosY: 50,
  };

  const sampleConduct: ConductCertData = {
    serialNo: 'UGHS/CC/2024/042',
    dated: '2024-06-12',
    examBasis: 'Passed in AHSC Exam. - 2024',
    name: 'DEBASIS CHANDRA PATRA',
    rel: 'S/o',
    pro: 'His',
    father: 'HARIHAR PATRA',
    sessionFrom: '2021-22',
    sessionTo: '2023-24',
    characterRating: 'good',
    closingWish: 'We wish him every success in his future academic and personal endeavours.',
    orientation: 'landscape',
  };

  const upperMarks = createEmptyMarks();
  upperMarks.u = [
    { col1: '86', col2: '89' },
    { col1: '81', col2: '84' },
    { col1: '92', col2: '94' },
    { col1: '88', col2: '90' },
    { col1: '84', col2: '86' },
    { col1: '79', col2: '82' },
    { col1: '91', col2: '93' },
    { col1: '94', col2: '95' },
    { col1: '90', col2: '92' },
  ];

  const sampleUpperMs: MarkSheetData = {
    type: 'u',
    name: 'LIPSA RANI NAYAK',
    father: 'PRASANTA NAYAK',
    mother: 'MAMATA NAYAK',
    dob: '2012-08-22',
    ses: '2024-25',
    reg: 'REG-216FA-109',
    roll: '14',
    cls: '7th',
    issue: '2025-04-10',
    marks: upperMarks,
  };

  const secMarks = createEmptyMarks();
  secMarks.s = [
    { col1: '84', col2: 'DISTINCTION' },
    { col1: '78', col2: 'DISTINCTION' },
    { col1: '81', col2: 'DISTINCTION' },
    { col1: '91', col2: 'EXCELLENT' },
    { col1: '87', col2: 'DISTINCTION' },
    { col1: '82', col2: 'DISTINCTION' },
  ];

  const sampleSecMs: MarkSheetData = {
    type: 's',
    name: 'RAKESH GOUDA',
    father: 'NARAYAN GOUDA',
    mother: 'SUJATA GOUDA',
    dob: '2010-01-19',
    ses: '2024-25',
    reg: 'BSE-216FA-2409',
    roll: '07',
    cls: '9th',
    issue: '2025-04-12',
    marks: secMarks,
  };

  return [
    {
      id: 'rec-sample-conduct',
      kind: 'conduct',
      studentName: sampleConduct.name,
      fatherName: sampleConduct.father,
      cls: 'Class X (AHSC)',
      session: `${sampleConduct.sessionFrom} – ${sampleConduct.sessionTo}`,
      identifier: sampleConduct.serialNo,
      issueDate: sampleConduct.dated,
      updatedAt: '2025-04-20T09:00:00.000Z',
      conductData: sampleConduct,
    },
    {
      id: 'rec-sample-1',
      kind: 'cert',
      studentName: sampleCert.name,
      fatherName: sampleCert.father,
      cls: sampleCert.cls,
      session: sampleCert.ses,
      identifier: sampleCert.eno,
      issueDate: sampleCert.issue,
      updatedAt: '2025-04-18T10:15:00.000Z',
      certData: sampleCert,
    },
    {
      id: 'rec-sample-2',
      kind: 'u',
      studentName: sampleUpperMs.name,
      fatherName: sampleUpperMs.father,
      cls: sampleUpperMs.cls,
      session: sampleUpperMs.ses,
      identifier: `${sampleUpperMs.reg} / Roll ${sampleUpperMs.roll}`,
      issueDate: sampleUpperMs.issue,
      updatedAt: '2025-04-10T11:30:00.000Z',
      markSheetData: sampleUpperMs,
    },
    {
      id: 'rec-sample-3',
      kind: 's',
      studentName: sampleSecMs.name,
      fatherName: sampleSecMs.father,
      cls: sampleSecMs.cls,
      session: sampleSecMs.ses,
      identifier: `${sampleSecMs.reg} / Roll ${sampleSecMs.roll}`,
      issueDate: sampleSecMs.issue,
      updatedAt: '2025-04-12T09:45:00.000Z',
      markSheetData: sampleSecMs,
    },
  ];
}

export function createSampleConductBulkStudents(): ConductBulkStudent[] {
  return [
    {
      id: 'bulk-demo-1',
      serialNo: '',
      name: 'DEBASIS CHANDRA PATRA',
      father: 'HARIHAR PATRA',
      rel: 'S/o',
      pro: 'His',
      characterRating: '',
    },
    {
      id: 'bulk-demo-2',
      serialNo: '',
      name: 'PRIYANKA KUMARI BISWAL',
      father: 'SANTOSH BISWAL',
      rel: 'D/o',
      pro: 'Her',
      characterRating: 'very good',
    },
    {
      id: 'bulk-demo-3',
      serialNo: '',
      name: 'SURAJ KUMAR NAYAK',
      father: 'JAGANNATH NAYAK',
      rel: 'S/o',
      pro: 'His',
      characterRating: '',
    },
    {
      id: 'bulk-demo-4',
      serialNo: '',
      name: 'ANITA RANI MAJHI',
      father: 'DAMODAR MAJHI',
      rel: 'D/o',
      pro: 'Her',
      characterRating: 'exemplary',
    },
  ];
}

export function createDefaultConductBulkBatch(): ConductBulkBatch {
  return {
    serialPrefix: 'UGHS/CC/2024/',
    startNumber: 1,
    dated: '2024-06-12',
    examBasis: 'Passed in AHSC Exam. - 2024',
    sessionFrom: '2021-22',
    sessionTo: '2023-24',
    characterRating: 'good',
    closingWish: 'We wish all success in future academic and personal endeavours.',
    showCutLine: true,
    fillOddBlank: false,
    students: createSampleConductBulkStudents(),
  };
}

export function resolveBulkStudentToConductData(
  batch: ConductBulkBatch,
  student: ConductBulkStudent,
  index: number
): ConductCertData {
  const autoSerial = batch.serialPrefix.trim()
    ? `${batch.serialPrefix}${String(batch.startNumber + index).padStart(3, '0')}`
    : String(batch.startNumber + index).padStart(3, '0');

  return {
    serialNo: student.serialNo.trim() || autoSerial,
    dated: batch.dated,
    examBasis: batch.examBasis,
    name: student.name,
    rel: student.rel,
    pro: student.pro,
    father: student.father,
    sessionFrom: batch.sessionFrom,
    sessionTo: batch.sessionTo,
    characterRating: student.characterRating.trim() || batch.characterRating || 'good',
    closingWish: batch.closingWish,
    orientation: 'portrait',
  };
}

export function createBlankConductSlotFromBatch(batch: ConductBulkBatch): ConductCertData {
  return {
    serialNo: '',
    dated: '',
    examBasis: batch.examBasis,
    name: '',
    rel: 'S/o / D/o',
    pro: '',
    father: '',
    sessionFrom: '',
    sessionTo: '',
    characterRating: '',
    closingWish: '',
    orientation: 'portrait',
  };
}

export function buildConductTwoUpPages(
  batch: ConductBulkBatch
): { top: ConductCertData; bottom: ConductCertData | null; pageNumber: number }[] {
  const resolved = batch.students.map((student, idx) =>
    resolveBulkStudentToConductData(batch, student, idx)
  );
  if (resolved.length === 0) {
    const empty = createBlankConductSlotFromBatch(batch);
    return [{ top: empty, bottom: batch.fillOddBlank ? empty : null, pageNumber: 1 }];
  }

  const pages: { top: ConductCertData; bottom: ConductCertData | null; pageNumber: number }[] = [];
  for (let i = 0; i < resolved.length; i += 2) {
    const top = resolved[i];
    const bottom =
      resolved[i + 1] ?? (batch.fillOddBlank ? createBlankConductSlotFromBatch(batch) : null);
    pages.push({
      top,
      bottom,
      pageNumber: Math.floor(i / 2) + 1,
    });
  }
  return pages;
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((cell) => cell.trim());
  }
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseConductBulkText(raw: string): ConductBulkStudent[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsed: ConductBulkStudent[] = [];

  lines.forEach((line, idx) => {
    const delimiter = line.includes('\t')
      ? '\t'
      : line.includes('|')
        ? '|'
        : ',';
    const cols = splitDelimitedLine(line, delimiter);
    if (cols.length === 0) return;

    const firstLower = (cols[0] || '').toLowerCase();
    const secondLower = (cols[1] || '').toLowerCase();
    // Skip header row if pasted from Excel/CSV
    if (
      idx === 0 &&
      (firstLower.includes('student') || firstLower === 'name') &&
      (secondLower.includes('father') || secondLower.includes('parent'))
    ) {
      return;
    }

    const name = cols[0] || '';
    const father = cols[1] || '';
    const relRaw = (cols[2] || '').toLowerCase();
    const serialNo = cols[3] || '';
    const characterRating = (cols[4] || '').toLowerCase();

    let rel: ConductRelationOption = 'S/o';
    let pro: PronounOption = 'His';
    if (
      relRaw.includes('d/o') ||
      relRaw === 'd' ||
      relRaw.includes('daughter') ||
      relRaw === 'f' ||
      relRaw === 'female' ||
      relRaw === 'girl'
    ) {
      rel = 'D/o';
      pro = 'Her';
    } else if (relRaw.includes('s/o') && relRaw.includes('d/o')) {
      rel = 'S/o / D/o';
      pro = '';
    } else if (!relRaw) {
      rel = 'S/o / D/o';
      pro = '';
    }

    if (name || father) {
      parsed.push({
        id: `imp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        serialNo,
        name,
        father,
        rel,
        pro,
        characterRating,
      });
    }
  });

  return parsed;
}

