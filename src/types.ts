export type AcuityScore = 1 | 2 | 3 | 4 | 5;

export interface InfoSources {
  crisp?: boolean;
  priorEmr?: boolean;
  family?: boolean;
  ems?: boolean;
}

export interface PatientCase {
  id: string;
  room: string;
  acuityScore: AcuityScore;
  createdAt: string;
  updatedAt: string;
  clearedAt?: string | null;
  isCleared: boolean;
  infoSources?: InfoSources;
  notes?: string;
}

export interface TaskThread {
  id: string;
  caseId?: string | null;
  text: string;
  createdAt: string;
  completedAt?: string | null;
  isCompleted: boolean;
  reminderMinutes?: number | null;
  dueAt?: string | null;
  lastAlertedAt?: string | null;
  snoozeCount?: number;
}

export interface FieldNote {
  id: string;
  text: string;
  createdAt: string;
  tag?: string;
}

export interface PredefinedTask {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface AppState {
  patientSeenCount: number;
  patientTarget: number;
  patientCases: PatientCase[];
  taskThreads: TaskThread[];
  fieldNotes: FieldNote[];
  recentlyClearedCaseIds: string[];
  predefinedTasks: PredefinedTask[];
}
