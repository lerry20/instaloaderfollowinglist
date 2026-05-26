import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { db } from '../db/schema'
import { todayISO, useBodyweightLogs, useSettings } from '../db/queries'
import { displayToKg, kgToDisplay } from '../lib/units'
import { toast } from '../state/toasts'
import CollapsibleSection from '../components/CollapsibleSection'

export default function Daily() {
  const settings = useSettings()
  if (!settings) return <div className="page"><p className="muted">Loading…</p></div>

  return (
    <div className="page">
      <h1 className="big-title">Daily check-in</h1>
      <p className="muted small">
        Lifting is half the equation. Track food, sleep, and how you feel — recovery is where muscle is actually built.
      </p>

      <NutritionSection />
      <SleepSection />
      <BodyweightSection />
      <MeasurementsSection />
    </div>
  )
}

function NutritionSection() {
  const settings = useSettings()
  const today = todayISO()
  const todayLog = useLiveQuery(() => db.nutrition.get(today), [today])
  const recent = useLiveQuery(async () => {
    const all = await db.nutrition.toArray()
    return all.sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-14)
  }, [])

  const [kcal, setKcal] = useState<number | ''>('')
  const [protein, setProtein] = useState<number | ''>('')
  useEffect(() => {
    if (todayLog) {
      setKcal(todayLog.kcal)
      setProtein(todayLog.proteinG)
    }
  }, [todayLog?.kcal, todayLog?.proteinG])

  const kcalTarget = settings?.kcalTarget
  const proteinTarget = settings?.proteinTargetG
  const series = (recent ?? []).map((r) => ({
    label: r.date.slice(5),
    kcal: r.kcal,
    protein: r.proteinG,
  }))

  const stat = todayLog ? `${todayLog.kcal} kcal` : undefined
  const subtitle = todayLog
    ? `${todayLog.proteinG}g protein${kcalTarget ? ` · target ${kcalTarget} kcal` : ''}`
    : kcalTarget && proteinTarget
      ? `target ${kcalTarget} kcal · ${proteinTarget}g protein`
      : 'set targets in Settings'

  return (
    <CollapsibleSection
      id="daily-nutrition"
      eyebrow="Today"
      title="Nutrition"
      subtitle={subtitle}
      stat={stat}
    >
      <div className="daily-input-row">
        <label className="field">
          <span>Calories</span>
          <input
            type="number"
            inputMode="numeric"
            value={kcal}
            onChange={(e) => setKcal(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="kcal"
          />
        </label>
        <label className="field">
          <span>Protein (g)</span>
          <input
            type="number"
            inputMode="numeric"
            value={protein}
            onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="g"
          />
        </label>
      </div>

      <button
        className="btn primary block"
        disabled={kcal === '' && protein === ''}
        onClick={async () => {
          await db.nutrition.put({
            date: today,
            kcal: Number(kcal) || 0,
            proteinG: Number(protein) || 0,
          })
          toast('Nutrition logged', { kind: 'success', duration: 1500 })
        }}
      >
        {todayLog ? 'Update today' : 'Log today'}
      </button>

      {kcalTarget && todayLog ? (
        <p className="muted small">
          {todayLog.kcal} / {kcalTarget} kcal · {todayLog.proteinG} / {proteinTarget}g protein
          {todayLog.kcal < kcalTarget ? ` · ${kcalTarget - todayLog.kcal} kcal to go` : ' · ✓ hit kcal target'}
        </p>
      ) : null}

      {series.length > 0 ? (
        <div style={{ width: '100%', height: 160, marginTop: '0.6rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 5, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#1d2547" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#7d88c0" fontSize={10} />
              <YAxis stroke="#7d88c0" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                }}
              />
              <Bar dataKey="kcal" fill="var(--primary)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </CollapsibleSection>
  )
}

function SleepSection() {
  const today = todayISO()
  const todayLog = useLiveQuery(() => db.sleep.get(today), [today])
  const [hours, setHours] = useState<number | ''>('')
  const [soreness, setSoreness] = useState<number>(3)

  useEffect(() => {
    if (todayLog) {
      setHours(todayLog.hours)
      setSoreness(todayLog.soreness)
    }
  }, [todayLog?.hours, todayLog?.soreness])

  const stat = todayLog ? `${todayLog.hours}h` : undefined
  const subtitle = todayLog
    ? `soreness ${todayLog.soreness}/5`
    : 'how did you rest last night?'

  return (
    <CollapsibleSection
      id="daily-sleep"
      eyebrow="Today"
      title="Sleep & recovery"
      subtitle={subtitle}
      stat={stat}
      defaultOpen={false}
    >
      <div className="daily-input-row">
        <label className="field">
          <span>Last night's sleep (hours)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="7.5"
          />
        </label>
      </div>
      <div className="field" style={{ marginTop: '0.5rem' }}>
        <span>Overall soreness</span>
        <div className="seg">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={soreness === n ? 'active' : ''}
              onClick={() => setSoreness(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="muted small">1 = fresh, 5 = wrecked</span>
      </div>
      <button
        className="btn primary block"
        disabled={hours === ''}
        onClick={async () => {
          await db.sleep.put({ date: today, hours: Number(hours) || 0, soreness })
          toast('Sleep logged', { kind: 'success', duration: 1500 })
        }}
      >
        {todayLog ? 'Update today' : 'Log today'}
      </button>
    </CollapsibleSection>
  )
}

function BodyweightSection() {
  const settings = useSettings()
  const logs = useBodyweightLogs()
  const today = todayISO()
  const units = settings?.units ?? 'kg'
  const todayLog = logs?.find((l) => l.date === today)
  const [weight, setWeight] = useState<number | ''>('')
  useEffect(() => {
    if (todayLog) setWeight(kgToDisplay(todayLog.weightKg, units))
  }, [todayLog?.weightKg, units])

  const last = logs && logs.length > 0 ? logs[logs.length - 1] : null
  const stat = todayLog
    ? `${kgToDisplay(todayLog.weightKg, units).toFixed(1)} ${units}`
    : last
      ? `${kgToDisplay(last.weightKg, units).toFixed(1)} ${units}`
      : undefined
  const subtitle = todayLog
    ? 'logged today'
    : last
      ? `last entry ${last.date.slice(5)}`
      : 'No entries yet'

  return (
    <CollapsibleSection
      id="daily-bodyweight"
      eyebrow="Today"
      title="Bodyweight"
      subtitle={subtitle}
      stat={stat}
    >
      <div className="bw-input-row">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weight}
          placeholder={units}
          onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <span className="muted small unit-label">{units}</span>
        <button
          className="btn primary"
          disabled={weight === ''}
          onClick={async () => {
            if (weight === '') return
            await db.bodyweight.put({ date: today, weightKg: displayToKg(Number(weight), units) })
            toast('Bodyweight saved', { kind: 'success', duration: 1500 })
          }}
        >
          {todayLog ? 'Update' : 'Log'}
        </button>
      </div>
    </CollapsibleSection>
  )
}

function MeasurementsSection() {
  const settings = useSettings()
  const units = settings?.units ?? 'kg'
  const useCm = true // store cm always; could expose inches later
  const today = todayISO()
  const todayLog = useLiveQuery(() => db.measurements.get(today), [today])
  const all = useLiveQuery(() => db.measurements.toArray(), []) ?? []

  const [waist, setWaist] = useState<number | ''>('')
  const [chest, setChest] = useState<number | ''>('')
  const [arm, setArm] = useState<number | ''>('')
  useEffect(() => {
    if (todayLog) {
      setWaist(todayLog.waistCm ?? '')
      setChest(todayLog.chestCm ?? '')
      setArm(todayLog.armCm ?? '')
    }
  }, [todayLog?.waistCm, todayLog?.chestCm, todayLog?.armCm])

  const last = useMemo(() => {
    const sorted = [...all].sort((a, b) => (a.date < b.date ? 1 : -1))
    return sorted[0]
  }, [all])

  void units
  void useCm

  const subtitle = last
    ? `${last.date.slice(5)} · waist ${last.waistCm ?? '—'} · chest ${last.chestCm ?? '—'} · arm ${last.armCm ?? '—'}`
    : 'weekly is enough'

  return (
    <CollapsibleSection
      id="daily-measurements"
      eyebrow="Weekly"
      title="Measurements"
      subtitle={subtitle}
      defaultOpen={false}
    >
      <div className="measurements-grid">
        <label className="field">
          <span>Waist</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={waist}
            onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={last?.waistCm ? String(last.waistCm) : 'cm'}
          />
        </label>
        <label className="field">
          <span>Chest</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={chest}
            onChange={(e) => setChest(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={last?.chestCm ? String(last.chestCm) : 'cm'}
          />
        </label>
        <label className="field">
          <span>Arm (flexed)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={arm}
            onChange={(e) => setArm(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={last?.armCm ? String(last.armCm) : 'cm'}
          />
        </label>
      </div>
      <button
        className="btn primary block"
        disabled={waist === '' && chest === '' && arm === ''}
        onClick={async () => {
          await db.measurements.put({
            date: today,
            waistCm: waist === '' ? undefined : Number(waist),
            chestCm: chest === '' ? undefined : Number(chest),
            armCm: arm === '' ? undefined : Number(arm),
          })
          toast('Measurements saved', { kind: 'success', duration: 1500 })
        }}
      >
        {todayLog ? 'Update today' : 'Log measurements'}
      </button>

    </CollapsibleSection>
  )
}
