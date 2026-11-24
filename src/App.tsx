import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ActiveView,
  ConductBulkBatch,
  ConductCertData,
  DEFAULT_SCHOOL_CONFIG,
  MARK_SHEET_LABELS,
  MarkSheetData,
  MarkSheetKind,
  RegistryRecord,
  SchoolConfig,
  StudyCertData,
  buildConductTwoUpPages,
  createDefaultConductBulkBatch,
  createDefaultConductCert,
  createDefaultMarkSheet,
  createDefaultStudyCert,
  createEmptyLegacyMarks,
  createEmptyMarks,
  createSampleConductBulkStudents,
  createSampleRegistryRecords,
  isLegacyMarkSheet,
  resolveBulkStudentToConductData,
} from './types/documents';
import { TopBar } from './components/TopBar';
import { PaperStage } from './components/PaperStage';
import { StudyCertEditor } from './components/StudyCertEditor';
import { ConductCertEditor } from './components/ConductCertEditor';
import { ConductBulkEditor } from './components/ConductBulkEditor';
import { MarkSheetEditor } from './components/MarkSheetEditor';
import { StudentRegistry } from './components/StudentRegistry';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { StudyCertificateSheet } from './components/sheets/StudyCertificateSheet';
import {
  ConductCertificateSheet,
  ConductTwoUpPage,
} from './components/sheets/ConductCertificateSheet';
import { MarkSheetSheet } from './components/sheets/MarkSheetSheet';
import { OfflineIndicator } from './components/OfflineIndicator';

const STORAGE_KEYS = {
  cert: 'ughs_malda_cert_draft_v1',
  conduct: 'ughs_malda_conduct_draft_v1',
  conductBulk: 'ughs_malda_conduct_bulk_v1',
  conductMode: 'ughs_malda_conduct_mode_v1',
  ms: 'ughs_malda_ms_draft_v1',
  registry: 'ughs_malda_registry_v1',
  school: 'ughs_malda_school_cfg_v1',
  theme: 'ughs_malda_theme_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('cert');
  const [conductMode, setConductMode] = useState<'single' | 'bulk'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.conductMode);
      return saved === 'bulk' ? 'bulk' : 'single';
    } catch {
      return 'single';
    }
  });
  const [bulkPageIndex, setBulkPageIndex] = useState(0);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false;
    } catch {
      return false;
    }
  });

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => ({
    ...DEFAULT_SCHOOL_CONFIG,
    ...readStorage<Partial<SchoolConfig>>(STORAGE_KEYS.school, {}),
  }));

  const [certData, setCertData] = useState<StudyCertData>(() => ({
    ...createDefaultStudyCert(),
    ...readStorage<Partial<StudyCertData>>(STORAGE_KEYS.cert, {}),
  }));

  const [conductData, setConductData] = useState<ConductCertData>(() => ({
    ...createDefaultConductCert(),
    ...readStorage<Partial<ConductCertData>>(STORAGE_KEYS.conduct, {}),
  }));

  const [conductBulk, setConductBulk] = useState<ConductBulkBatch>(() => {
    const defaults = createDefaultConductBulkBatch();
    const saved = readStorage<Partial<ConductBulkBatch>>(STORAGE_KEYS.conductBulk, {});
    return {
      ...defaults,
      ...saved,
      students:
        Array.isArray(saved.students) && saved.students.length > 0
          ? saved.students
          : defaults.students,
    };
  });

  const [markSheetData, setMarkSheetData] = useState<MarkSheetData>(() => {
    const base = createDefaultMarkSheet('p');
    const saved = readStorage<Partial<MarkSheetData>>(STORAGE_KEYS.ms, {});
    return {
      ...base,
      ...saved,
      formatVersion: saved.formatVersion === 'legacy' ? 'legacy' : 'current',
      marks: {
        ...createEmptyMarks(),
        ...(saved.marks || {}),
      },
      legacyMarks: {
        ...createEmptyLegacyMarks(),
        ...(saved.legacyMarks || {}),
      },
    };
  });

  const [registry, setRegistry] = useState<RegistryRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.registry);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as RegistryRecord[];
      }
    } catch {
      // fall through to initial sample records
    }
    return createSampleRegistryRecords();
  });

  const [editingCertRecordId, setEditingCertRecordId] = useState<string | null>(null);
  const [editingConductRecordId, setEditingConductRecordId] = useState<string | null>(null);
  const [editingMsRecordId, setEditingMsRecordId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blankMode, setBlankMode] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [batchPrintQueue, setBatchPrintQueue] = useState<RegistryRecord[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const bulkPages = useMemo(() => buildConductTwoUpPages(conductBulk), [conductBulk]);
  const safeBulkPageIdx = Math.min(bulkPageIndex, Math.max(0, bulkPages.length - 1));
  const activeBulkPage = bulkPages[safeBulkPageIdx] ?? bulkPages[0];

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage quota errors
    }
  }, [isDark]);

  // Auto-persist drafts, bulk batch, registry, and school header
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cert, JSON.stringify(certData));
    } catch {
      // ignore
    }
  }, [certData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.conduct, JSON.stringify(conductData));
    } catch {
      // ignore
    }
  }, [conductData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.conductBulk, JSON.stringify(conductBulk));
    } catch {
      // ignore
    }
  }, [conductBulk]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.conductMode, conductMode);
    } catch {
      // ignore
    }
  }, [conductMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ms, JSON.stringify(markSheetData));
    } catch {
      // ignore
    }
  }, [markSheetData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.registry, JSON.stringify(registry));
    } catch {
      // ignore
    }
  }, [registry]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.school, JSON.stringify(schoolConfig));
    } catch {
      // ignore
    }
  }, [schoolConfig]);

  // Trigger window.print() cleanly when a batch print queue is staged
  useEffect(() => {
    if (!batchPrintQueue || batchPrintQueue.length === 0) return;
    const timer = window.setTimeout(() => {
      window.print();
    }, 60);
    const handleAfterPrint = () => {
      setBatchPrintQueue(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [batchPrintQueue]);

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'ms-primary') {
      setMarkSheetData((prev) => ({ ...prev, type: prev.type === 'u' ? 'u' : 'p' }));
    } else if (view === 'ms-upper') {
      setMarkSheetData((prev) => ({ ...prev, type: 'u' }));
    } else if (view === 'ms-secondary') {
      setMarkSheetData((prev) => ({ ...prev, type: 's' }));
    }
  };

  const handleSwitchMarkSheetKind = (kind: MarkSheetKind) => {
    setMarkSheetData((prev) => ({ ...prev, type: kind }));
    if (kind === 'p') setActiveView('ms-primary');
    else if (kind === 'u') setActiveView('ms-upper');
    else setActiveView('ms-secondary');
  };

  const handlePrimaryPrint = () => {
    if (activeView === 'registry') {
      const targets =
        selectedIds.length > 0
          ? registry.filter((r) => selectedIds.includes(r.id))
          : registry;
      if (targets.length === 0) {
        showToast('No saved documents available to print.');
        return;
      }
      setBatchPrintQueue(targets);
      return;
    }
    setBatchPrintQueue(null);
    window.print();
  };

  const handleSaveCertToRegistry = () => {
    const id = editingCertRecordId || `cert-${Date.now()}`;
    const record: RegistryRecord = {
      id,
      kind: 'cert',
      studentName: certData.name.trim().toUpperCase(),
      fatherName: certData.father.trim().toUpperCase(),
      cls: certData.cls.trim(),
      session: certData.ses.trim(),
      identifier: certData.eno.trim() || certData.serialNo.trim(),
      issueDate: certData.issue,
      updatedAt: new Date().toISOString(),
      certData: { ...certData },
    };

    setRegistry((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) return prev.map((r) => (r.id === id ? record : r));
      return [record, ...prev];
    });
    setEditingCertRecordId(id);
    showToast(
      editingCertRecordId
        ? 'Study Certificate updated in Registry.'
        : 'Study Certificate saved to Registry.'
    );
  };

  const handleSaveConductToRegistry = () => {
    const id = editingConductRecordId || `conduct-${Date.now()}`;
    const sessionSpan = [conductData.sessionFrom.trim(), conductData.sessionTo.trim()]
      .filter(Boolean)
      .join(' – ');

    const record: RegistryRecord = {
      id,
      kind: 'conduct',
      studentName: conductData.name.trim().toUpperCase(),
      fatherName: conductData.father.trim().toUpperCase(),
      cls: conductData.examBasis.trim() || 'AHSC',
      session: sessionSpan,
      identifier: conductData.serialNo.trim(),
      issueDate: conductData.dated,
      updatedAt: new Date().toISOString(),
      conductData: { ...conductData },
    };

    setRegistry((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) return prev.map((r) => (r.id === id ? record : r));
      return [record, ...prev];
    });
    setEditingConductRecordId(id);
    showToast(
      editingConductRecordId
        ? 'Conduct Certificate updated in Registry.'
        : 'Conduct Certificate saved to Registry.'
    );
  };

  const handleSaveBulkBatchToRegistry = () => {
    const nonEmpty = conductBulk.students.filter(
      (s) => s.name.trim() !== '' || s.father.trim() !== ''
    );
    if (nonEmpty.length === 0) {
      showToast('Enter at least one student before saving the batch.');
      return;
    }

    const now = new Date().toISOString();
    const sessionSpan = [conductBulk.sessionFrom.trim(), conductBulk.sessionTo.trim()]
      .filter(Boolean)
      .join(' – ');

    const newRecords: RegistryRecord[] = conductBulk.students
      .map((student, idx) => ({ student, idx }))
      .filter(({ student }) => student.name.trim() !== '' || student.father.trim() !== '')
      .map(({ student, idx }) => {
        const resolved = resolveBulkStudentToConductData(conductBulk, student, idx);
        return {
          id: `conduct-batch-${Date.now()}-${idx}`,
          kind: 'conduct' as const,
          studentName: resolved.name.trim().toUpperCase(),
          fatherName: resolved.father.trim().toUpperCase(),
          cls: resolved.examBasis.trim() || 'AHSC',
          session: sessionSpan,
          identifier: resolved.serialNo,
          issueDate: resolved.dated,
          updatedAt: now,
          conductData: { ...resolved, orientation: 'landscape' },
        };
      });

    setRegistry((prev) => [...newRecords, ...prev]);
    showToast(`Saved ${newRecords.length} Conduct Certificates to Registry.`);
  };

  const handleSaveMsToRegistry = () => {
    const id = editingMsRecordId || `ms-${Date.now()}`;
    const identifier =
      markSheetData.type === 'p'
        ? ''
        : [
            markSheetData.reg.trim(),
            markSheetData.roll.trim() ? `Roll ${markSheetData.roll.trim()}` : '',
          ]
            .filter(Boolean)
            .join(' / ');

    const clonedMarks = {
      p: markSheetData.marks.p.map((r) => ({ ...r })),
      u: markSheetData.marks.u.map((r) => ({ ...r })),
      s: markSheetData.marks.s.map((r) => ({ ...r })),
    };

    const baseLegacy = markSheetData.legacyMarks || createEmptyLegacyMarks();
    const clonedLegacyMarks = {
      p: baseLegacy.p.map((r) => ({ ...r })),
      u: baseLegacy.u.map((r) => ({ ...r })),
    };

    const record: RegistryRecord = {
      id,
      kind: markSheetData.type,
      studentName: markSheetData.name.trim().toUpperCase(),
      fatherName: markSheetData.father.trim().toUpperCase(),
      cls: markSheetData.cls.trim(),
      session: markSheetData.ses.trim(),
      identifier,
      issueDate: markSheetData.issue,
      updatedAt: new Date().toISOString(),
      markSheetData: {
        ...markSheetData,
        marks: clonedMarks,
        legacyMarks: clonedLegacyMarks,
      },
    };

    setRegistry((prev) => {
      const exists = prev.some((r) => r.id === id);
      if (exists) return prev.map((r) => (r.id === id ? record : r));
      return [record, ...prev];
    });
    setEditingMsRecordId(id);
    showToast(
      editingMsRecordId
        ? 'Mark Sheet updated in Registry.'
        : 'Mark Sheet saved to Registry.'
    );
  };

  const handleCopyFromMarkSheetToCert = () => {
    if (!markSheetData.name && !markSheetData.father && !markSheetData.mother) {
      showToast('Mark Sheet has no student details to copy yet.');
      return;
    }
    setCertData((prev) => ({
      ...prev,
      name: markSheetData.name || prev.name,
      father: markSheetData.father || prev.father,
      mother: markSheetData.mother || prev.mother,
      dob: markSheetData.dob || prev.dob,
      cls: markSheetData.cls || prev.cls,
      issue: markSheetData.issue || prev.issue,
    }));
    showToast('Copied student details from Mark Sheet.');
  };

  const handleCopyFromCertToConduct = () => {
    if (!certData.name && !certData.father) {
      showToast('Study Certificate has no student details to copy yet.');
      return;
    }
    const nextRel =
      certData.rel === 'Son'
        ? 'S/o'
        : certData.rel === 'Daughter'
          ? 'D/o'
          : 'S/o / D/o';

    setConductData((prev) => ({
      ...prev,
      name: certData.name || prev.name,
      father: certData.father || prev.father,
      rel: nextRel,
      pro: certData.pro || prev.pro,
      dated: certData.issue || prev.dated,
    }));
    showToast('Copied student details from Study Certificate.');
  };

  const handleCopyFromCertToMarkSheet = () => {
    if (!certData.name && !certData.father && !certData.mother) {
      showToast('Study Certificate has no student details to copy yet.');
      return;
    }
    setMarkSheetData((prev) => ({
      ...prev,
      name: certData.name || prev.name,
      father: certData.father || prev.father,
      mother: certData.mother || prev.mother,
      dob: certData.dob || prev.dob,
      cls: certData.cls || prev.cls,
      issue: certData.issue || prev.issue,
    }));
    showToast('Copied student details from Study Certificate.');
  };

  const handleLoadCertSample = () => {
    const sample = createSampleRegistryRecords().find((r) => r.kind === 'cert')?.certData;
    if (sample) setCertData(sample);
    setEditingCertRecordId(null);
    showToast('Loaded sample Study Certificate.');
  };

  const handleLoadConductSample = () => {
    const sample = createSampleRegistryRecords().find((r) => r.kind === 'conduct')?.conductData;
    if (sample) setConductData({ ...sample, orientation: conductData.orientation });
    setEditingConductRecordId(null);
    showToast('Loaded sample Conduct-cum-Character Certificate.');
  };

  const handleLoadConductDemoBatch = () => {
    setConductBulk((prev) => ({
      ...prev,
      students: createSampleConductBulkStudents(),
    }));
    setBulkPageIndex(0);
    showToast('Loaded 4 sample students across 2 A4 pages (2 per page).');
  };

  const handleClearConductBatch = () => {
    setConductBulk((prev) => ({
      ...prev,
      students: [
        {
          id: `bulk-${Date.now()}-1`,
          serialNo: '',
          name: '',
          father: '',
          rel: 'S/o',
          pro: 'His',
          characterRating: '',
        },
        {
          id: `bulk-${Date.now()}-2`,
          serialNo: '',
          name: '',
          father: '',
          rel: 'D/o',
          pro: 'Her',
          characterRating: '',
        },
      ],
    }));
    setBulkPageIndex(0);
    showToast('Cleared batch to 2 blank slots (1 A4 page).');
  };

  const handleLoadMsSample = () => {
    const samples = createSampleRegistryRecords();
    const kind = markSheetData.type;
    const isLegacy = isLegacyMarkSheet(markSheetData);

    if (isLegacy && kind === 'p') {
      const legacy = createEmptyLegacyMarks();
      legacy.p = [
        { fullMarks: '100', col1: '82', col2: 'DISTINCTION' },
        { fullMarks: '100', col1: '76', col2: 'DISTINCTION' },
        { fullMarks: '100', col1: '88', col2: 'DISTINCTION' },
        { fullMarks: '100', col1: '79', col2: 'DISTINCTION' },
        { fullMarks: '50', col1: '44', col2: 'DISTINCTION' },
      ];
      setMarkSheetData({
        ...createDefaultMarkSheet('p', 'legacy'),
        name: 'SANTOSH KUMAR PUJARI',
        father: 'MADHAB PUJARI',
        mother: 'TULASI PUJARI',
        dob: '2007-05-16',
        ses: '2017-18',
        cls: '5th',
        issue: '2025-04-15',
        legacyMarks: legacy,
      });
      setEditingMsRecordId(null);
      showToast('Loaded sample Older Primary Annual Exam Mark Sheet.');
      return;
    }

    if (isLegacy && kind === 'u') {
      const legacy = createEmptyLegacyMarks();
      legacy.u = [
        { fullMarks: '100', col1: '81', col2: 'DISTINCTION' },
        { fullMarks: '100', col1: '74', col2: 'FIRST DIV' },
        { fullMarks: '100', col1: '86', col2: 'DISTINCTION' },
        { fullMarks: '100', col1: '79', col2: 'DISTINCTION' },
        { fullMarks: '50', col1: '40', col2: 'DISTINCTION' },
        { fullMarks: '50', col1: '38', col2: 'DISTINCTION' },
        { fullMarks: '50', col1: '41', col2: 'DISTINCTION' },
        { fullMarks: '50', col1: '43', col2: 'DISTINCTION' },
        { fullMarks: '50', col1: '45', col2: 'EXCELLENT' },
      ];
      setMarkSheetData({
        ...createDefaultMarkSheet('u', 'legacy'),
        name: 'MANOJ KUMAR BHATRA',
        father: 'DAMODAR BHATRA',
        mother: 'KAMALA BHATRA',
        dob: '2006-03-11',
        ses: '2018-19',
        reg: 'REG-216FA-084',
        roll: '19',
        cls: '7th',
        issue: '2025-04-15',
        legacyMarks: legacy,
      });
      setEditingMsRecordId(null);
      showToast('Loaded sample Older Upper Primary Annual Exam Mark Sheet.');
      return;
    }

    if (kind === 's') {
      const s = samples.find((r) => r.kind === 's')?.markSheetData;
      if (s) setMarkSheetData({ ...createDefaultMarkSheet('s'), ...s });
    } else if (kind === 'u') {
      const u = samples.find((r) => r.kind === 'u')?.markSheetData;
      if (u) setMarkSheetData({ ...createDefaultMarkSheet('u'), ...u });
    } else {
      const primaryMarks = createEmptyMarks();
      primaryMarks.p = [
        { col1: '88', col2: '91' },
        { col1: '84', col2: '86' },
        { col1: '95', col2: '94' },
        { col1: '89', col2: '92' },
        { col1: '85', col2: '88' },
        { col1: '92', col2: '95' },
        { col1: '94', col2: '96' },
      ];
      setMarkSheetData({
        ...createDefaultMarkSheet('p', 'current'),
        name: 'ANANYA PRADHAN',
        father: 'BIBHUTI PRADHAN',
        mother: 'KAVITA PRADHAN',
        dob: '2014-07-09',
        ses: '2024-25',
        reg: '',
        roll: '',
        cls: '5th',
        issue: '2025-04-08',
        marks: primaryMarks,
      });
    }
    setEditingMsRecordId(null);
    showToast(`Loaded sample ${MARK_SHEET_LABELS[kind].short} Mark Sheet.`);
  };

  const handleClearCert = () => {
    setCertData((prev) => ({
      ...createDefaultStudyCert(),
      ses: prev.ses || '2024/2025',
      rel: prev.rel,
      pro: prev.pro,
    }));
    setEditingCertRecordId(null);
    showToast('Cleared Study Certificate fields.');
  };

  const handleClearConduct = () => {
    setConductData((prev) => ({
      ...createDefaultConductCert(),
      examBasis: prev.examBasis || 'Passed in AHSC Exam. - 2024',
      orientation: prev.orientation,
    }));
    setEditingConductRecordId(null);
    showToast('Cleared Conduct Certificate fields.');
  };

  const handleClearMs = () => {
    const currentType = markSheetData.type;
    const currentFormat = markSheetData.formatVersion || 'current';
    setMarkSheetData(createDefaultMarkSheet(currentType, currentFormat));
    setEditingMsRecordId(null);
    showToast('Cleared Mark Sheet fields.');
  };

  const handleOpenRecord = (rec: RegistryRecord) => {
    if (rec.kind === 'cert' && rec.certData) {
      setCertData({ ...createDefaultStudyCert(), ...rec.certData });
      setEditingCertRecordId(rec.id);
      setActiveView('cert');
    } else if (rec.kind === 'conduct' && rec.conductData) {
      setConductData({ ...createDefaultConductCert(), ...rec.conductData });
      setEditingConductRecordId(rec.id);
      setConductMode('single');
      setActiveView('conduct');
    } else if (rec.markSheetData) {
      setMarkSheetData({
        ...createDefaultMarkSheet(
          rec.markSheetData.type,
          rec.markSheetData.formatVersion || 'current'
        ),
        ...rec.markSheetData,
        marks: {
          ...createEmptyMarks(),
          ...rec.markSheetData.marks,
        },
        legacyMarks: {
          ...createEmptyLegacyMarks(),
          ...(rec.markSheetData.legacyMarks || {}),
        },
      });
      setEditingMsRecordId(rec.id);
      if (rec.markSheetData.type === 'p') setActiveView('ms-primary');
      else if (rec.markSheetData.type === 'u') setActiveView('ms-upper');
      else setActiveView('ms-secondary');
    }
  };

  const handleDuplicateRecord = (rec: RegistryRecord) => {
    const copy: RegistryRecord = {
      ...rec,
      id: `dup-${Date.now()}`,
      studentName: rec.studentName ? `${rec.studentName} (COPY)` : 'COPY',
      updatedAt: new Date().toISOString(),
    };
    setRegistry((prev) => [copy, ...prev]);
    showToast('Duplicated student record.');
  };

  const handleDeleteRecord = (id: string) => {
    setRegistry((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    if (editingCertRecordId === id) setEditingCertRecordId(null);
    if (editingConductRecordId === id) setEditingConductRecordId(null);
    if (editingMsRecordId === id) setEditingMsRecordId(null);
    showToast('Removed record from Registry.');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (visibleIds: string[]) => {
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Document Type',
      'Student Name',
      'Father Name',
      'Class / Basis',
      'Session',
      'Serial / Enrolment / Roll',
      'Date of Issue',
      'Updated At',
    ];
    const escapeCell = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = registry.map((r) => [
      r.id,
      r.kind === 'cert'
        ? 'Study Certificate'
        : r.kind === 'conduct'
          ? 'Conduct-cum-Character Certificate'
          : `${MARK_SHEET_LABELS[r.kind].short} Mark Sheet${
              r.markSheetData?.formatVersion === 'legacy' ? ' (Older Format)' : ''
            }`,
      r.studentName,
      r.fatherName,
      r.cls,
      r.session,
      r.identifier,
      r.issueDate,
      r.updatedAt,
    ]);
    const csv = [headers.join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `govt-ughs-malda-register-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported CSV student register.');
  };

  const handleExportJson = () => {
    const payload = {
      schoolConfig,
      exportedAt: new Date().toISOString(),
      records: registry,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `govt-ughs-malda-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON backup.');
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const incoming = Array.isArray(parsed) ? parsed : parsed?.records;
        if (!Array.isArray(incoming)) {
          showToast('Invalid backup file format.');
          return;
        }
        setRegistry((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const merged = [...prev];
          for (const item of incoming as RegistryRecord[]) {
            if (item && typeof item.id === 'string' && !existingIds.has(item.id)) {
              merged.unshift(item);
            }
          }
          return merged;
        });
        if (parsed?.schoolConfig) {
          setSchoolConfig({ ...DEFAULT_SCHOOL_CONFIG, ...parsed.schoolConfig });
        }
        showToast(`Imported ${incoming.length} record(s) into Registry.`);
      } catch {
        showToast('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const primaryActionLabel =
    activeView === 'registry'
      ? selectedIds.length > 0
        ? `Print Selected (${selectedIds.length})`
        : 'Print All Saved'
      : activeView === 'conduct' && conductMode === 'bulk'
        ? `Print Batch (${bulkPages.length} ${bulkPages.length === 1 ? 'Page' : 'Pages'})`
        : 'Print / Save PDF';

  const isMarkSheetView =
    activeView === 'ms-primary' ||
    activeView === 'ms-upper' ||
    activeView === 'ms-secondary';

  return (
    <div className="flex min-h-screen flex-col bg-[#edf2fa] text-slate-900 dark:bg-[#0b1120] dark:text-slate-100">
      <TopBar
        activeView={activeView}
        onSelectView={handleSelectView}
        onPrimaryAction={handlePrimaryPrint}
        primaryActionLabel={primaryActionLabel}
        registryCount={registry.length}
      />

      {/* Study Certificate Studio */}
      {activeView === 'cert' && (
        <div className="no-print flex flex-1 flex-col lg:flex-row">
          <StudyCertEditor
            data={certData}
            onChange={setCertData}
            onSaveToRegistry={handleSaveCertToRegistry}
            onCopyFromMarkSheet={handleCopyFromMarkSheetToCert}
            onLoadSample={handleLoadCertSample}
            onClear={handleClearCert}
            editingRecordId={editingCertRecordId}
          />
          <PaperStage
            title="Study Certificate"
            subtitle={`BSE ${schoolConfig.bseCode} · UDISE ${schoolConfig.udiseCode}`}
            orientation="portrait"
            blankMode={blankMode}
            onToggleBlankMode={() => setBlankMode((prev) => !prev)}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides((prev) => !prev)}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenSettings={() => setSettingsOpen(true)}
            onAppInstalled={() => showToast('Govt. UGHS Malda app installed successfully.')}
          >
            <StudyCertificateSheet
              data={certData}
              school={schoolConfig}
              blankMode={blankMode}
              showGuides={showGuides}
            />
          </PaperStage>
        </div>
      )}

      {/* Conduct-cum-Character Certificate Studio (Single OR Bulk 2-Per-Page) */}
      {activeView === 'conduct' && conductMode === 'single' && (
        <div className="no-print flex flex-1 flex-col lg:flex-row">
          <ConductCertEditor
            data={conductData}
            onChange={setConductData}
            onSaveToRegistry={handleSaveConductToRegistry}
            onCopyFromStudyCert={handleCopyFromCertToConduct}
            onLoadSample={handleLoadConductSample}
            onClear={handleClearConduct}
            editingRecordId={editingConductRecordId}
            onSwitchToBulk={() => setConductMode('bulk')}
          />
          <PaperStage
            title="Conduct-cum-Character Certificate"
            subtitle={`BSE ${schoolConfig.bseCode} · UDISE ${schoolConfig.udiseCode}`}
            orientation={conductData.orientation}
            blankMode={blankMode}
            onToggleBlankMode={() => setBlankMode((prev) => !prev)}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides((prev) => !prev)}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenSettings={() => setSettingsOpen(true)}
            onAppInstalled={() => showToast('Govt. UGHS Malda app installed successfully.')}
          >
            <ConductCertificateSheet
              data={conductData}
              school={schoolConfig}
              blankMode={blankMode}
              showGuides={showGuides}
            />
          </PaperStage>
        </div>
      )}

      {activeView === 'conduct' && conductMode === 'bulk' && (
        <div className="no-print flex flex-1 flex-col lg:flex-row">
          <ConductBulkEditor
            batch={conductBulk}
            onChange={setConductBulk}
            activePageIndex={safeBulkPageIdx}
            onSelectPage={setBulkPageIndex}
            onSwitchToSingle={() => setConductMode('single')}
            onSaveBatchToRegistry={handleSaveBulkBatchToRegistry}
            onLoadDemoBatch={handleLoadConductDemoBatch}
            onClearBatch={handleClearConductBatch}
          />
          <PaperStage
            title="Conduct Certificate Bulk Sheet (2 per A4)"
            subtitle={`${conductBulk.students.length} students · ${bulkPages.length} A4 ${
              bulkPages.length === 1 ? 'page' : 'pages'
            }`}
            orientation="portrait"
            extraControls={
              <div className="flex items-center rounded-lg border border-blue-200/90 bg-[#e8f0fc] p-0.5 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  disabled={safeBulkPageIdx <= 0}
                  onClick={() => setBulkPageIndex((p) => Math.max(0, p - 1))}
                  aria-label="Previous A4 page"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#294378] transition-colors hover:bg-white hover:text-[#162b5a] disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono-tabular whitespace-nowrap px-2 text-xs font-semibold text-[#162b5a] dark:text-slate-200">
                  Page {safeBulkPageIdx + 1} / {bulkPages.length}
                </span>
                <button
                  type="button"
                  disabled={safeBulkPageIdx >= bulkPages.length - 1}
                  onClick={() =>
                    setBulkPageIndex((p) => Math.min(bulkPages.length - 1, p + 1))
                  }
                  aria-label="Next A4 page"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#294378] transition-colors hover:bg-white hover:text-[#162b5a] disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            }
            blankMode={blankMode}
            onToggleBlankMode={() => setBlankMode((prev) => !prev)}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides((prev) => !prev)}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenSettings={() => setSettingsOpen(true)}
            onAppInstalled={() => showToast('Govt. UGHS Malda app installed successfully.')}
          >
            {activeBulkPage && (
              <ConductTwoUpPage
                topData={activeBulkPage.top}
                bottomData={activeBulkPage.bottom}
                school={schoolConfig}
                showCutLine={conductBulk.showCutLine}
                blankMode={blankMode}
                showGuides={showGuides}
              />
            )}
          </PaperStage>
        </div>
      )}

      {/* Mark Sheet Studio */}
      {isMarkSheetView && (
        <div className="no-print flex flex-1 flex-col lg:flex-row">
          <MarkSheetEditor
            data={markSheetData}
            onChange={setMarkSheetData}
            onSwitchKind={handleSwitchMarkSheetKind}
            onSaveToRegistry={handleSaveMsToRegistry}
            onCopyFromCert={handleCopyFromCertToMarkSheet}
            onLoadSample={handleLoadMsSample}
            onClear={handleClearMs}
            editingRecordId={editingMsRecordId}
          />
          <PaperStage
            title={`${MARK_SHEET_LABELS[markSheetData.type].short} Mark Sheet`}
            subtitle={
              isLegacyMarkSheet(markSheetData)
                ? `Older Annual Exam Format (${
                    (markSheetData.legacyMarks?.[markSheetData.type === 'u' ? 'u' : 'p'] || [])
                      .length || (markSheetData.type === 'u' ? 9 : 5)
                  } Subjects)`
                : `${MARK_SHEET_LABELS[markSheetData.type].short} Class (${
                    (markSheetData.marks[markSheetData.type] || []).length
                  } Subjects)`
            }
            orientation="portrait"
            blankMode={blankMode}
            onToggleBlankMode={() => setBlankMode((prev) => !prev)}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides((prev) => !prev)}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenSettings={() => setSettingsOpen(true)}
            onAppInstalled={() => showToast('Govt. UGHS Malda app installed successfully.')}
          >
            <MarkSheetSheet
              data={markSheetData}
              school={schoolConfig}
              blankMode={blankMode}
              showGuides={showGuides}
            />
          </PaperStage>
        </div>
      )}

      {/* Student Registry */}
      {activeView === 'registry' && (
        <StudentRegistry
          records={registry}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenRecord={handleOpenRecord}
          onDuplicateRecord={handleDuplicateRecord}
          onDeleteRecord={handleDeleteRecord}
          onPrintRecords={(recs) => setBatchPrintQueue(recs)}
          onCreateNew={(kind) => {
            if (kind === 'cert') {
              setEditingCertRecordId(null);
              setActiveView('cert');
            } else if (kind === 'conduct') {
              setEditingConductRecordId(null);
              setActiveView('conduct');
            } else {
              setEditingMsRecordId(null);
              handleSelectView('ms-primary');
            }
          }}
          onExportCsv={handleExportCsv}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onLoadSamples={() => {
            setRegistry(createSampleRegistryRecords());
            showToast('Loaded sample student records.');
          }}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onOpenSettings={() => setSettingsOpen(true)}
          onAppInstalled={() => showToast('Govt. UGHS Malda app installed successfully.')}
        />
      )}

      <SchoolSettingsModal
        open={settingsOpen}
        config={schoolConfig}
        onChange={setSchoolConfig}
        onClose={() => setSettingsOpen(false)}
      />

      <OfflineIndicator />

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-lg border border-[#c89b3c]/70 bg-[#162b5a] px-4 py-2.5 text-xs font-medium text-white shadow-lg dark:border-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#f2c14e] dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Exact Millimeter-Accurate A4 Print Output Container */}
      <div className="print-only-container" aria-hidden="true">
        {batchPrintQueue && batchPrintQueue.length > 0 ? (
          batchPrintQueue.map((rec) => {
            const isLandscape =
              rec.kind === 'conduct' && rec.conductData?.orientation === 'landscape';
            return (
              <div
                key={rec.id}
                className={isLandscape ? 'print-page-landscape' : 'print-page-portrait'}
              >
                {rec.kind === 'cert' && rec.certData ? (
                  <StudyCertificateSheet data={rec.certData} school={schoolConfig} />
                ) : rec.kind === 'conduct' && rec.conductData ? (
                  <ConductCertificateSheet data={rec.conductData} school={schoolConfig} />
                ) : rec.markSheetData ? (
                  <MarkSheetSheet data={rec.markSheetData} school={schoolConfig} />
                ) : null}
              </div>
            );
          })
        ) : activeView === 'cert' ? (
          <div className="print-page-portrait">
            <StudyCertificateSheet
              data={certData}
              school={schoolConfig}
              blankMode={blankMode}
            />
          </div>
        ) : activeView === 'conduct' && conductMode === 'bulk' ? (
          bulkPages.map((page) => (
            <div key={page.pageNumber} className="print-page-portrait">
              <ConductTwoUpPage
                topData={page.top}
                bottomData={page.bottom}
                school={schoolConfig}
                showCutLine={conductBulk.showCutLine}
                blankMode={blankMode}
              />
            </div>
          ))
        ) : activeView === 'conduct' ? (
          <div
            className={
              conductData.orientation === 'landscape'
                ? 'print-page-landscape'
                : 'print-page-portrait'
            }
          >
            <ConductCertificateSheet
              data={conductData}
              school={schoolConfig}
              blankMode={blankMode}
            />
          </div>
        ) : (
          <div className="print-page-portrait">
            <MarkSheetSheet
              data={markSheetData}
              school={schoolConfig}
              blankMode={blankMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}
