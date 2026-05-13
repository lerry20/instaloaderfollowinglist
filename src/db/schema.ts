import Dexie, { type Table } from 'dexie'

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const DAY_LABEL: Record<DayKey, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
}

export type MuscleKey =
  | 'chest'
  | 'frontDelt'
  | 'sideDelt'
  | 'rearDelt'
  | 'bicep'
  | 'tricep'
  | 'forearm'
  | 'lat'
  | 'midBack'
  | 'lowerBack'
  | 'core'
  | 'glute'
  | 'quad'
  | 'hamstring'
  | 'calf'
  | 'trap'

export type PostureKey =
  | 'benchPress'
  | 'squat'
  | 'deadlift'
  | 'overheadPress'
  | 'row'
  | 'pullup'
  | 'curl'
  | 'tricepExt'
  | 'lateralRaise'
  | 'facePull'
  | 'legPress'
  | 'lunge'
  | 'hipHinge'
  | 'plank'
  | 'calfRaise'
  | 'standing'

export interface Exercise {
  id: string
  name: string
  primaryMuscle: MuscleKey
  secondaryMuscles: MuscleKey[]
  equipment: string
  postureKey: PostureKey
  muscleHighlights: MuscleKey[]
  cues: string[]
  bulkingTip: string
}

export interface PlanItem {
  exerciseId: string
  targetSets: number
  targetReps: string
  targetRPE: number
}

export interface PlanDay {
  label: string
  items: PlanItem[]
}

export interface Plan {
  id: string
  name: string
  weekTemplate: Record<DayKey, PlanDay | null>
}

export interface Session {
  id?: number
  date: string
  dayKey: DayKey
  planDayLabel: string
  startedAt: number
  completedAt: number | null
}

export interface SetLog {
  id?: number
  sessionId: number
  exerciseId: string
  setIndex: number
  weight: number
  reps: number
  rpe: number | null
  loggedAt: number
}

export interface BodyweightLog {
  date: string
  weightKg: number
}

export interface Settings {
  id: 1
  units: 'kg' | 'lb'
  defaultRestSec: number
  goalNotes: string
}

class WorkoutDB extends Dexie {
  exercises!: Table<Exercise, string>
  plans!: Table<Plan, string>
  sessions!: Table<Session, number>
  setLogs!: Table<SetLog, number>
  bodyweight!: Table<BodyweightLog, string>
  settings!: Table<Settings, number>

  constructor() {
    super('workoutdb')
    this.version(1).stores({
      exercises: 'id, primaryMuscle',
      plans: 'id',
      sessions: '++id, date, dayKey',
      setLogs: '++id, sessionId, exerciseId, loggedAt',
      bodyweight: 'date',
      settings: 'id',
    })
  }
}

export const db = new WorkoutDB()
