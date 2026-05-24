import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Goal, type Units } from '../db/schema'
import { useAllRoutines, useSettings } from '../db/queries'
import {
  useT,
  useLocaleStore,
  LOCALES,
  LOCALE_LABEL,
  LOCALE_FLAG,
  type Locale,
} from '../i18n'

export default function Onboarding() {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const navigate = useNavigate()
  const settings = useSettings()
  const [step, setStep] = useState(0)
  const [units, setUnits] = useState<Units>('kg')
  const [goal, setGoal] = useState<Goal>('bulk')
  const [routineId, setRoutineId] = useState<string>('ppl-6day')
  const routines = useAllRoutines() ?? []
  const builtIn = routines.filter((r) => r.builtIn)

  // If user is already onboarded (e.g. opened /welcome by mistake or after
  // re-install), bounce them to the main app.
  useEffect(() => {
    if (settings?.onboarded) navigate('/', { replace: true })
  }, [settings?.onboarded, navigate])

  async function finish() {
    const existing = await db.settings.get(1)
    await db.settings.put({
      id: 1,
      units,
      defaultRestSec: existing?.defaultRestSec ?? 90,
      goal,
      goalNotes:
        goal === 'bulk'
          ? 'Bulk: gain ~0.25 kg / week. Push every working set hard, stop one rep short of failure, and add 2.5 kg whenever you hit the top of the rep range two sessions in a row.'
          : goal === 'cut'
          ? 'Cut: lose ~0.5 kg / week. Maintain working weights — strength preservation matters more than progression.'
          : 'Recomp: hold bodyweight steady, push working sets to grow muscle while body-fat slowly drops.',
      onboarded: true,
      notificationsEnabled: existing?.notificationsEnabled ?? false,
      activeRoutineId: routineId,
      skillLevel: existing?.skillLevel ?? 'beginner',
      theme: existing?.theme ?? 'system',
      periodizationPhase: existing?.periodizationPhase ?? 'volume',
      periodizationWeek: existing?.periodizationWeek ?? 1,
    })
    navigate('/')
  }

  const totalSteps = 2

  return (
    <div className="page onboarding">
      <header className="onboard-header">
        <span className="brand">
          <span className="brand-mark" aria-hidden /> BulkLog
        </span>
        <span className="muted small">{step + 1} / {totalSteps}</span>
      </header>

      {step === 0 ? (
        <section className="card">
          <h2>{t('onboarding.welcome_title')}</h2>
          <p className="muted small">{t('onboarding.welcome_sub')}</p>

          <h4 style={{ marginTop: '1rem' }}>{t('onboarding.choose_language')}</h4>
          <div className="onboard-grid">
            {LOCALES.map((l: Locale) => (
              <button
                key={l}
                className={`onboard-tile${locale === l ? ' active' : ''}`}
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
              >
                <strong>{LOCALE_FLAG[l]} {LOCALE_LABEL[l]}</strong>
              </button>
            ))}
          </div>

          <h4 style={{ marginTop: '1.2rem' }}>{t('onboarding.choose_goal')}</h4>
          <div className="onboard-grid">
            {(
              [
                { id: 'bulk', titleKey: 'settings.goal_bulk', subKey: 'onboarding.goal_bulk_sub' as const },
                { id: 'cut', titleKey: 'settings.goal_cut', subKey: 'onboarding.goal_cut_sub' as const },
                { id: 'recomp', titleKey: 'settings.goal_recomp', subKey: 'onboarding.goal_recomp_sub' as const },
              ] as { id: Goal; titleKey: 'settings.goal_bulk' | 'settings.goal_cut' | 'settings.goal_recomp'; subKey: string }[]
            ).map((g) => (
              <button
                key={g.id}
                className={`onboard-tile${goal === g.id ? ' active' : ''}`}
                onClick={() => setGoal(g.id)}
              >
                <strong>{t(g.titleKey)}</strong>
              </button>
            ))}
          </div>

          <h4 style={{ marginTop: '1.2rem' }}>{t('settings.units')}</h4>
          <div className="seg big">
            <button className={units === 'kg' ? 'active' : ''} onClick={() => setUnits('kg')}>{t('unit.kg')}</button>
            <button className={units === 'lb' ? 'active' : ''} onClick={() => setUnits('lb')}>{t('unit.lb')}</button>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="card">
          <h2>{t('onboarding.choose_routine')}</h2>
          <div className="routine-onboard-list">
            {builtIn.map((r) => (
              <button
                key={r.id}
                className={`onboard-tile wide${routineId === r.id ? ' active' : ''}`}
                onClick={() => setRoutineId(r.id)}
              >
                <strong>{r.name}</strong>
                <span className="muted small">{r.description}</span>
                <span className="muted small">{t('train.n_exercises', { n: r.workouts.length })}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="onboard-actions">
        {step > 0 ? (
          <button className="btn ghost" onClick={() => setStep((s) => s - 1)}>{t('common.back')}</button>
        ) : <span />}
        {step < totalSteps - 1 ? (
          <button className="btn primary" onClick={() => setStep((s) => s + 1)}>{t('onboarding.next')}</button>
        ) : (
          <button className="btn primary" onClick={finish}>{t('onboarding.get_started')}</button>
        )}
      </div>
    </div>
  )
}
