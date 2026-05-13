import type { Exercise, MuscleKey } from '../db/schema'

interface CatalogRecord {
  name: string
  category: string
  mechanic: string | null
  equipment: string | null
  level: string | null
  force: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
}

interface CatalogFile {
  source: string
  count: number
  exercises: CatalogRecord[]
}

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises'

const MUSCLE_MAP: Record<string, MuscleKey> = {
  abdominals: 'core',
  obliques: 'core',
  forearms: 'forearm',
  biceps: 'bicep',
  shoulders: 'frontDelt',
  chest: 'chest',
  triceps: 'tricep',
  calves: 'calf',
  glutes: 'glute',
  abductors: 'glute',
  traps: 'trap',
  neck: 'trap',
  quadriceps: 'quad',
  adductors: 'quad',
  hamstrings: 'hamstring',
  lats: 'lat',
  'middle back': 'midBack',
  'lower back': 'lowerBack',
}

function mapMuscle(s: string): MuscleKey | null {
  return MUSCLE_MAP[s.toLowerCase()] ?? null
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

function recordToExercise(r: CatalogRecord): Exercise | null {
  if (r.category !== 'strength' && r.category !== 'strongman' && r.category !== 'powerlifting' && r.category !== 'olympic weightlifting') {
    return null
  }
  const primaries = r.primaryMuscles.map(mapMuscle).filter((m): m is MuscleKey => m !== null)
  const secondaries = r.secondaryMuscles.map(mapMuscle).filter((m): m is MuscleKey => m !== null)
  if (primaries.length === 0) return null
  const primaryMuscle = primaries[0]
  const cues = (r.instructions ?? []).slice(0, 6)
  const isCompound = r.mechanic === 'compound'
  return {
    id: slugify(r.name),
    name: r.name,
    primaryMuscle,
    secondaryMuscles: Array.from(new Set(secondaries)).filter((m) => m !== primaryMuscle),
    equipment: r.equipment ?? '—',
    cues: cues.length > 0 ? cues : ['No technique notes provided.'],
    videoQuery: `${r.name} technique form`,
    imageUrls: r.images.map((path) => `${CDN}/${path}`),
    category: isCompound ? 'compound' : 'isolation',
    defaultRestSec: isCompound ? 120 : 60,
    isCurated: false,
  }
}

let cached: Exercise[] | null = null
let pending: Promise<Exercise[]> | null = null

export async function loadFullCatalog(): Promise<Exercise[]> {
  if (cached) return cached
  if (pending) return pending
  pending = (async () => {
    const res = await fetch('/exercise-catalog.json', { cache: 'force-cache' })
    if (!res.ok) throw new Error('Failed to load exercise catalog')
    const data = (await res.json()) as CatalogFile
    cached = data.exercises
      .map(recordToExercise)
      .filter((e): e is Exercise => e !== null)
      .sort((a, b) => a.name.localeCompare(b.name))
    return cached
  })()
  try {
    return await pending
  } finally {
    pending = null
  }
}

export function clearCatalogCache() {
  cached = null
}
