import { AppState, PatientCase, PredefinedTask } from '../types';

const KEY = 'er-threadkeeper-v1';

const DEFAULT_TASK_TEXTS = [
  'CT performed? x3478',
  'xray performed? 3477',
  'Early SW x3494',
  'MRI? 558',
  'Vascular x3411',
  'U/w 3457 or 6077',
  'Pain or Nausea Recheck',
  'Urine?',
  'Trops?',
  'Update Patient',
  'Call consult',
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
