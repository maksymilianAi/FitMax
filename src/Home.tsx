import { useMemo } from 'react'
import type { Program } from './data'
import { buildSteps, estimateMinutes, fmt, sessionTitle, useStored, type HistoryEntry, type SessionSpec } from './lib'

const DEFAULT_SPEC: SessionSpec = { warmup: 2, workout: true, cooldown: true, mobility: false }

const WARM_LABEL: Record<number, string> = { 0: 'None', 1: 'Short', 2: 'Standard', 3: 'Full' }

function weekStart(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return x
}

export function Home({
  program,
  history,
  onStart,
}: {
  program: Program
  history: HistoryEntry[]
  onStart: (spec: SessionSpec) => void
}) {
  const [spec, setSpec] = useStored<SessionSpec>('fitmax.spec', DEFAULT_SPEC)

  const steps = useMemo(() => buildSteps(spec, program), [spec, program])
  const minutes = estimateMinutes(steps)
  const valid = steps.length > 0

  const stats = useMemo(() => {
    const ws = weekStart().getTime()
    const thisWeek = history.filter((h) => new Date(h.date).getTime() >= ws).length
    const days = new Set(history.map((h) => new Date(h.date).toDateString()))
    let streak = 0
    const d = new Date()
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1)
    while (days.has(d.toDateString())) {
      streak++
      d.setDate(d.getDate() - 1)
    }
    return { thisWeek, total: history.length, streak }
  }, [history])

  const last = history[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const setMobility = (m: boolean) =>
    setSpec(m ? { warmup: 3, workout: false, cooldown: true, mobility: true } : { ...DEFAULT_SPEC })

  return (
    <div className="screen">
      <header className="hero">
        <div className="muted cap">{today}</div>
        <h1>Hey. Time to move.</h1>
      </header>

      <div className="stats">
        <div>
          <b>{stats.thisWeek}</b>
          <span>this week</span>
        </div>
        <div>
          <b>{stats.streak}</b>
          <span>day streak</span>
        </div>
        <div>
          <b>{stats.total}</b>
          <span>total</span>
        </div>
      </div>

      <section className="card start">
        <div className="seg" role="tablist">
          <button className={!spec.mobility ? 'on' : ''} onClick={() => setMobility(false)}>
            Workout
          </button>
          <button className={spec.mobility ? 'on' : ''} onClick={() => setMobility(true)}>
            Mobility day
          </button>
        </div>

        {!spec.mobility && (
          <>
            <div className="field">
              <label>Warm-up</label>
              <div className="seg small">
                {([0, 1, 2, 3] as const).map((w) => (
                  <button key={w} className={spec.warmup === w ? 'on' : ''} onClick={() => setSpec({ ...spec, warmup: w })}>
                    {WARM_LABEL[w]}
                  </button>
                ))}
              </div>
            </div>
            <div className="toggles">
              <label className="check">
                <input type="checkbox" checked={spec.workout} onChange={(e) => setSpec({ ...spec, workout: e.target.checked })} />
                <span>Main program</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={spec.cooldown} onChange={(e) => setSpec({ ...spec, cooldown: e.target.checked })} />
                <span>Cool-down</span>
              </label>
            </div>
          </>
        )}
        {spec.mobility && <p className="muted">Dynamic mobility and a full stretch. No kettlebell. Finish with the massage gun.</p>}

        <div className="start-row">
          <div>
            <div className="big-num">~{minutes} min</div>
            <div className="muted cap">
              {steps.length} steps · {sessionTitle(spec).toLowerCase()}
            </div>
          </div>
          <button className="btn primary big" disabled={!valid} onClick={() => onStart(spec)}>
            Start
          </button>
        </div>
        <p className="hint">In a session: Space next, ← back, S skip</p>
      </section>

      {last && (
        <section className="card">
          <h3>Last session</h3>
          <div className="last">
            <div>
              <b>{last.title}</b>
              <div className="muted cap">
                {new Date(last.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })} · {fmt(last.seconds)}
              </div>
            </div>
            <div className="muted">
              {last.log.filter((l) => l.status === 'done').length} of {last.log.length}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
