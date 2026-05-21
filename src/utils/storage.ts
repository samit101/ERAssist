import { AppState, PatientCase, PredefinedTask } from '../types';

const KEY = 'er-threadkeeper-v1';

const DEFAULT_TASK_TEXTS = [
  'Trops back?',
  'Repeat trop back?',
  'Did patient pee?',
  'UA back?',
  'CT resulted?',
  'X-ray resulted?',
  'Ultrasound resulted?',
  'Lactate back?',
  'Repeat vitals?',
  'Pain better?',
  'Nausea better?',
  'Breathing better?',
  'Ambulated?',
  'PO challenge?',
  'Consultant called back?',
  'Re-page consultant',
  'Call family',
  'Update patient',
  'Talk to nurse',
  'Dispo decision',
  'Discharge instructions',
  'Prescriptions sent?',
  'Work/school note?',
  'Finish MDM',
  'Document reassessment',
  'Check CRISP information',
  'Review old records',
  'Call admitting team',
  'Bed assigned?',
];

const makeDefaults = () => {
  const now = new Date().toISOString();
  return DEFAULT_TASK_TEXTS.map((text, i) => ({
    id: `default-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    text,
    createdAt: now,
    updatedAt: now,
    isDefault: true,
  })) as PredefinedTask[];
};

export const defaultPredefinedTasks = makeDefaults();

export const defaultState: AppState = {
  patientSeenCount: 0,
  patientTarget: 12,
  patientCases: [],
  taskThreads: [],
  fieldNotes: [],
  recentlyClearedCaseIds: [],
  predefinedTasks: defaultPredefinedTasks,
};

function migrateCase(pc: any): PatientCase {
  return {
    ...pc,
    acuityScore: pc.acuityScore ?? pc.acuitySwag ?? 3,
    infoSources: pc.infoSources ?? {},
  };
}

export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      patientCases: (parsed.patientCases ?? []).map(migrateCase),
      predefinedTasks:
        parsed.predefinedTasks?.length > 0
          ? parsed.predefinedTasks
          : defaultPredefinedTasks,
    };
  } catch {
    return defaultState;
  }
};

export const saveState = (state: AppState) =>
  localStorage.setItem(KEY, JSON.stringify(state));
