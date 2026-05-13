interface Props {
  label: string
  unit?: string
  value: number | ''
  onChange: (next: number) => void
  step: number
  bigStep?: number
  min?: number
  max?: number
  decimals?: number
  placeholder?: string
}

export default function NumberStepper({
  label,
  unit,
  value,
  onChange,
  step,
  bigStep,
  min = 0,
  max,
  decimals = 1,
  placeholder,
}: Props) {
  function bump(delta: number) {
    const base = value === '' ? min : Number(value)
    let next = base + delta
    if (max !== undefined && next > max) next = max
    if (next < min) next = min
    const factor = Math.pow(10, decimals)
    next = Math.round(next * factor) / factor
    onChange(next)
  }

  return (
    <div className="stepper">
      <div className="stepper-head">
        <span className="stepper-label">{label}</span>
        {unit ? <span className="stepper-unit">{unit}</span> : null}
      </div>
      <div className="stepper-controls">
        {bigStep ? (
          <button
            type="button"
            className="stepper-btn"
            onClick={() => bump(-bigStep)}
            aria-label={`${label} minus ${bigStep}`}
          >
            −{bigStep}
          </button>
        ) : null}
        <button
          type="button"
          className="stepper-btn"
          onClick={() => bump(-step)}
          aria-label={`${label} minus ${step}`}
        >
          −{step}
        </button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') {
              onChange(0)
              return
            }
            const n = Number(raw)
            if (!Number.isNaN(n)) onChange(n)
          }}
          aria-label={label}
        />
        <button
          type="button"
          className="stepper-btn"
          onClick={() => bump(step)}
          aria-label={`${label} plus ${step}`}
        >
          +{step}
        </button>
        {bigStep ? (
          <button
            type="button"
            className="stepper-btn"
            onClick={() => bump(bigStep)}
            aria-label={`${label} plus ${bigStep}`}
          >
            +{bigStep}
          </button>
        ) : null}
      </div>
    </div>
  )
}
