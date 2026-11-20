import { DEFAULT_PROGRAM, EX, EXERCISES, PATTERNS, type Program } from './data'

function Stepper({ value, onChange, min = 0, max = 99, step = 1, suffix = '' }: { value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - step))} aria-label="Less">
        −
      </button>
      <span>
        {value}
        {suffix}
      </span>
      <button onClick={() => onChange(Math.min(max, value + step))} aria-label="More">
        +
      </button>
    </div>
  )
}

export function ProgramScreen({ program, setProgram }: { program: Program; setProgram: (p: Program) => void }) {
  const update = (i: number, patch: Partial<Program['items'][number]>) =>
    setProgram({ ...program, items: program.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) })

  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= program.items.length) return
    const items = [...program.items]
    ;[items[i], items[j]] = [items[j], items[i]]
    setProgram({ ...program, items })
  }

  const available = EXERCISES.filter((e) => e.kind === 'strength' && !program.items.some((i) => i.id === e.id))

  return (
    <div className="screen">
      <h1>Program</h1>
      <p className="muted">The circuit runs in this order. Disabled exercises are left out of the workout.</p>

      <div className="card two">
        <div>
          <div className="lbl">Rounds</div>
          <Stepper value={program.rounds} min={1} max={6} onChange={(n) => setProgram({ ...program, rounds: n })} />
        </div>
        <div>
          <div className="lbl">Rest between rounds</div>
          <Stepper value={program.rest} min={15} max={240} step={15} suffix=" s" onChange={(n) => setProgram({ ...program, rest: n })} />
        </div>
      </div>

      <ul className="plist">
        {program.items.map((it, i) => {
          const e = EX[it.id]
          return (
            <li key={it.id} className={it.enabled ? '' : 'off'}>
              <div className="p-top">
                <label className="switch">
                  <input type="checkbox" checked={it.enabled} onChange={(ev) => update(i, { enabled: ev.target.checked })} />
                  <span />
                </label>
                <div className="p-name">
                  <b>{e.name}</b>
                  <div className="tags">
                    {e.patterns.map((p) => (
                      <span key={p} className={`tag t-${p}`}>
                        {PATTERNS[p].label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mv">
                  <button onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
                    ↑
                  </button>
                  <button onClick={() => move(i, 1)} aria-label="Move down" disabled={i === program.items.length - 1}>
                    ↓
                  </button>
                </div>
              </div>
              <div className="p-ctrl">
                <div>
                  <div className="lbl">{e.unit === 'time' ? 'Seconds' : e.sides ? 'Reps per side' : 'Reps'}</div>
                  <Stepper value={it.reps} min={1} max={e.unit === 'time' ? 120 : 30} step={e.unit === 'time' ? 5 : 1} onChange={(n) => update(i, { reps: n })} />
                </div>
                {e.kg !== null && (
                  <div>
                    <div className="lbl">Weight</div>
                    <Stepper value={it.kg ?? 0} min={0} max={40} step={2} suffix=" kg" onChange={(n) => update(i, { kg: n })} />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {available.length > 0 && (
        <div className="card">
          <div className="lbl">Add exercise</div>
          <select
            className="select"
            value=""
            onChange={(ev) => {
              const e = EX[ev.target.value]
              if (!e) return
              setProgram({ ...program, items: [...program.items, { id: e.id, enabled: true, reps: e.amount, kg: e.kg }] })
            }}
          >
            <option value="">Choose from the list…</option>
            {available.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {e.patterns.map((p) => PATTERNS[p].label).join(', ')}
              </option>
            ))}
          </select>
        </div>
      )}

      <button className="btn ghost" onClick={() => confirm('Reset to the starter program?') && setProgram(DEFAULT_PROGRAM)}>
        Reset to starter
      </button>
    </div>
  )
}
