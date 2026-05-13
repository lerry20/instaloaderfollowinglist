import Dexie, { type Table } from 'dexie'

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

export const MUSCLE_LABEL: Record<MuscleKey, string> = {
  chest: 'Chest',
  frontDelt: 'Front delts',
  sideDelt: 'Side delts',
  rearDelt: 'Rear delts',
  bicep: 'Biceps',
  tricep: 'Triceps',
  forearm: 'Forearms',
  lat: 'Lats',
  midBack: 'Mid back',
  lowerBack: 'Lower back',
  core: 'Core',
  glute: 'Glutes',
  quad: 'Quads',
  hamstring: 'Hamstrings',
  calf: 'Calves',
  trap: 'Traps',
}

export type ExerciseCategory = 'compound' | 'isolation'

export interface Exercise {
  id: string
  name: string
  primaryMuscle: MuscleKey
  secondaryMuscles: MuscleKey[]
  equipment: string
  cues: string[]
  bulkingTip?: string
  videoQuery: string
  imageUrls: string[]
  category: ExerciseCategory
  defaultRestSec: number
  isCurated: boolean
}

export interface PlanItem {
  exerciseId: string
  targetSets: number
  targetReps: string
  targetRPE: number
}

export interface WorkoutDef {
  id: string
  name: string
  description?: string
  items: PlanItem[]
}

export interface Routine {
  id: string
  name: string
  description: string
  builtIn: boolean
  workouts: WorkoutDef[]
}

export interface Session {
  id?: number
  date: string
  routineId: string
  workoutId: string
  workoutName: string
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

export interface NutritionLog {
  date: string
  kcal: number
  proteinG: number
  notes?: string
}

export interface SleepLog {
  date: string
  hours: number
  soreness: number // 1-5
  notes?: string
}

export interface MeasurementLog {
  date: string
  waistCm?: number
  chestCm?: number
  armCm?: number
}

export interface CoachMessage {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  ts: number
}

export type Units = 'kg' | 'lb'
export type Goal = 'bulk' | 'cut' | 'recomp'
export type SkillLevel = 'beginner' | 'advanced'
export type Theme = 'system' | 'light' | 'dark'
export type PeriodizationPhase = 'volume' | 'intensification' | 'deload'

export interface Settings {
  id: 1
  units: Units
  defaultRestSec: number
  goalNotes: string
  goal: Goal
  onboarded: boolean
  notificationsEnabled: boolean
  activeRoutineId: string
  skillLevel: SkillLevel
  theme: Theme
  kcalTarget?: number
  proteinTargetG?: number
  aiApiKey?: string
  periodizationPhase: PeriodizationPhase
  periodizationWeek: number
}

class WorkoutDB extends Dexie {
  exercises!: Table<Exercise, string>
  routines!: Table<Routine, string>
  sessions!: Table<Session, number>
  setLogs!: Table<SetLog, number>
  bodyweight!: Table<BodyweightLog, string>
  settings!: Table<Settings, number>
  nutrition!: Table<NutritionLog, string>
  sleep!: Table<SleepLog, string>
  measurements!: Table<MeasurementLog, string>
  coachMessages!: Table<CoachMessage, number>
  // Old "plans" table kept for migration path; not used after v4.
  plans!: Table<unknown, string>

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
        const sessions = await tx.table('sessions').toArray()
        for (const s of sessions) {
          if (!s.items) await tx.table('sessions').update(s.id!, { items: [] })
        }
        const logs = await tx.table('setLogs').toArray()
        for (const l of logs) {
          if (l.isWarmup === undefined) await tx.table('setLogs').update(l.id!, { isWarmup: false })
        }
      })

    // v4 — routines instead of plans, unified catalog, drop dayKey index.
    this.version(4)
      .stores({
        exercises: 'id, primaryMuscle',
        plans: 'id', // kept for migration read; cleared after
        routines: 'id',
        sessions: '++id, date, routineId, workoutId',
        setLogs: '++id, sessionId, exerciseId, loggedAt',
        bodyweight: 'date',
        settings: 'id',
      })
      .upgrade(async (tx) => {
        // Migrate any existing "plan" to a Routine.
        const plans = await tx.table('plans').toArray()
        if (plans.length > 0) {
          const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
          for (const p of plans) {
            const workouts: WorkoutDef[] = []
            for (const d of dayOrder) {
              const day = p.weekTemplate?.[d]
              if (!day) continue
              workouts.push({
                id: `${p.id}-${d}`,
                name: day.label || d,
                items: day.items || [],
              })
            }
            if (workouts.length > 0) {
              await tx.table('routines').put({
                id: p.id,
                name: p.name || 'Imported plan',
                description: 'Imported from your previous weekly plan.',
                builtIn: false,
                workouts,
              })
            }
          }
          await tx.table('plans').clear()
        }

        // Mark legacy seeded exercises as curated, drop the old 'source' field.
        const exs = await tx.table('exercises').toArray()
        for (const e of exs) {
          await tx.table('exercises').update(e.id, {
            isCurated: e.source === 'core' || e.source === undefined,
            source: undefined,
          })
        }

        const settings = await tx.table('settings').get(1)
        if (settings) {
          await tx.table('settings').put({
            ...settings,
            activeRoutineId: settings.activeRoutineId || 'default',
            goal: settings.goal ?? 'bulk',
            onboarded: settings.onboarded ?? false,
            notificationsEnabled: settings.notificationsEnabled ?? false,
          })
        }
      })

    // v5 — daily check-in (nutrition / sleep / measurements) + AI coach
    // + periodization phase tracking.
    this.version(5)
      .stores({
        exercises: 'id, primaryMuscle',
        routines: 'id',
        sessions: '++id, date, routineId, workoutId',
        setLogs: '++id, sessionId, exerciseId, loggedAt',
        bodyweight: 'date',
        settings: 'id',
        nutrition: 'date',
        sleep: 'date',
        measurements: 'date',
        coachMessages: '++id, ts',
      })
      .upgrade(async (tx) => {
        const s = await tx.table('settings').get(1)
        if (s) {
          await tx.table('settings').put({
            ...s,
            periodizationPhase: s.periodizationPhase ?? 'volume',
            periodizationWeek: s.periodizationWeek ?? 1,
          })
        }
      })
  }
}

export const db = new WorkoutDB()
