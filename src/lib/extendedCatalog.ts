import type { Exercise, MuscleKey, PostureKey } from '../db/schema'

interface ExercemusRecord {
  name: string
  category: string
  description?: string
  equipment: string[]
  instructions: string[]
  primary_muscles: string[]
  secondary_muscles: string[]
  video?: string
  variations_on?: string[]
}

interface ExercemusFile {
  license: string
  exercises: ExercemusRecord[]
}

let cached: Exercise[] | null = null
let pending: Promise<Exercise[]> | null = null

const MUSCLE_MAP: Record<string, MuscleKey> = {
  forearms: 'forearm',
  biceps: 'bicep',
  brachialis: 'bicep',
  shoulders: 'frontDelt',
  chest: 'chest',
  triceps: 'tricep',
  abs: 'core',
  obliques: 'core',
  'serratus anterior': 'core',
  calves: 'calf',
  soleus: 'calf',
  glutes: 'glute',
  abductors: 'glute',
  traps: 'trap',
  neck: 'trap',
  quads: 'quad',
  adductors: 'quad',
  hamstrings: 'hamstring',
  lats: 'lat',
  'middle back': 'midBack',
  'lower back': 'lowerBack',
}

function mapMuscle(s: string): MuscleKey | null {
  return MUSCLE_MAP[s.toLowerCase()] ?? null
}

function postureFromMuscle(m: MuscleKey | null): PostureKey {
  switch (m) {
    case 'chest':
      return 'benchPress'
    case 'frontDelt':
    case 'sideDelt':
    case 'rearDelt':
      return 'overheadPress'
    case 'lat':
    case 'midBack':
      return 'row'
    case 'bicep':
    case 'forearm':
      return 'curl'
    case 'tricep':
      return 'tricepExt'
    case 'quad':
      return 'squat'
    case 'hamstring':
    case 'glute':
    case 'lowerBack':
      return 'hipHinge'
    case 'calf':
      return 'calfRaise'
    case 'core':
      return 'plank'
    case 'trap':
      return 'standing'
    default:
      return 'standing'
  }
}

function slugify(name: string): string {
  return (
    'x-' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

function recordToExercise(r: ExercemusRecord): Exercise | null {
  if (r.category !== 'strength' && r.category !== 'strongman' && r.category !== 'olympic weightlifting' && r.category !== 'powerlifting') {
    // Skip cardio / stretching / plyo for the lifting-focused MVP; user can add them later.
    return null
  }
  const primaries = r.primary_muscles.map(mapMuscle).filter((m): m is MuscleKey => m !== null)
  const secondaries = r.secondary_muscles.map(mapMuscle).filter((m): m is MuscleKey => m !== null)
  if (primaries.length === 0) return null
  const primaryMuscle = primaries[0]
  const cues = (r.instructions ?? []).slice(0, 5)
  return {
    id: slugify(r.name),
    name: r.name,
    primaryMuscle,
    secondaryMuscles: Array.from(new Set(secondaries)).filter((m) => m !== primaryMuscle),
    equipment: (r.equipment ?? []).join(', ') || '—',
    postureKey: postureFromMuscle(primaryMuscle),
    muscleHighlights: Array.from(new Set([primaryMuscle, ...secondaries])),
    cues: cues.length > 0 ? cues : ['No technique notes provided in the extended catalog.'],
    bulkingTip: '',
    youtubeQuery: `${r.name} technique`,
    category: 'isolation',
    defaultRestSec: 90,
    source: 'extended',
    videoUrl: r.video,
  }
}

export async function loadExtendedCatalog(): Promise<Exercise[]> {
  if (cached) return cached
  if (pending) return pending
  pending = (async () => {
    const res = await fetch('/extended-exercises.json', { cache: 'force-cache' })
    if (!res.ok) throw new Error('Failed to load extended catalog')
    const data = (await res.json()) as ExercemusFile
    cached = data.exercises
      .map(recordToExercise)
      .filter((e): e is Exercise => e !== null)
      // Sort alphabetically for browseability.
      .sort((a, b) => a.name.localeCompare(b.name))
    return cached
  })()
  try {
    return await pending
  } finally {
    pending = null
  }
}

export function clearExtendedCatalogCache() {
  cached = null
}
