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

export type ExerciseCategory = 'compound' | 'isolation'

export type ExerciseSource = 'core' | 'extended'

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
  youtubeQuery: string
  category: ExerciseCategory
  defaultRestSec: number
  source?: ExerciseSource
  videoUrl?: string
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
  items: PlanItem[]
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
  isWarmup: boolean
  loggedAt: number
}

export interface BodyweightLog {
  date: string
  weightKg: number
}

export type Units = 'kg' | 'lb'
export type Goal = 'bulk' | 'cut' | 'recomp'

export interface Settings {
  id: 1
  units: Units
  defaultRestSec: number
  goalNotes: string
  goal: Goal
  onboarded: boolean
  notificationsEnabled: boolean
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
    this.version(2)
      .stores({
        exercises: 'id, primaryMuscle, source',
        plans: 'id',
        sessions: '++id, date, dayKey',
        setLogs: '++id, sessionId, exerciseId, loggedAt',
        bodyweight: 'date',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        const sessions = await tx.table<Session>('sessions').toArray()
        for (const s of sessions) {
          if (!s.items) {
            await tx.table('sessions').update(s.id!, { items: [] })
          }
        }
        const logs = await tx.table<SetLog>('setLogs').toArray()
        for (const l of logs) {
          if (l.isWarmup === undefined) {
            await tx.table('setLogs').update(l.id!, { isWarmup: false })
          }
        }
        const settings = await tx.table<Settings>('settings').get(1)
        if (settings) {
          await tx.table('settings').put({
            ...settings,
            goal: settings.goal ?? 'bulk',
            onboarded: settings.onboarded ?? false,
            notificationsEnabled: settings.notificationsEnabled ?? false,
          })
        }
        const exs = await tx.table<Exercise>('exercises').toArray()
        for (const e of exs) {
          if (!e.source) {
            await tx.table('exercises').update(e.id, { source: 'core' })
          }
        }
      })
  }
}

export const db = new WorkoutDB()
