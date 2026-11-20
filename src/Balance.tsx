import { useMemo, useState } from 'react'
import { BALANCE_PATTERNS, EX, PATTERNS, type Pattern, type Program } from './data'
import type { HistoryEntry } from './lib'

type Vol = Record<Pattern, number>
const empty = (): Vol => ({ hinge: 0, squat: 0, push: 0, pull: 0, carry: 0, core: 0, mobility: 0 })

function addVol(v: Vol, exId: string, units: number) {
  const e = EX[exId]
  if (!e) return
  e.patterns.forEach((p) => (v[p] += units / e.patterns.length))
}

const unitsOf = (e: { unit: 'reps' | 'time'; sides: boolean }, amount: number) =>
  (e.unit === 'time' ? amount / 4 : amount) * (e.sides ? 2 : 1)

export function Balance({ program, history }: { program: Program; history: HistoryEntry[] }) {
  const [mode, setMode] = useState<'program' | 'history'>('program')

  const vol = useMemo(() => {
    const v = empty()
    if (mode === 'program') {
      program.items.filter((i) => i.enabled).forEach((i) => addVol(v, i.id, unitsOf(EX[i.id], i.reps) * program.rounds))
    } else {
      const from = Date.now() - 14 * 86400000
      history
        .filter((h) => new Date(h.date).getTime() >= from)
        .forEach((h) =>
          h.log
            .filter((l) => l.section === 'workout' && l.status === 'done')
            .forEach((l) => addVol(v, l.exId, unitsOf({ unit: l.unit, sides: l.perSide }, l.amount))),
        )
    }
    return v
  }, [mode, program, history])

  const total = BALANCE_PATTERNS.reduce((a, p) => a + vol[p], 0)
  const max = Math.max(1, ...BALANCE_PATTERNS.map((p) => vol[p]))

  const notes: string[] = []
  if (total > 0) {
    BALANCE_PATTERNS.forEach((p) => {
      if (vol[p] === 0) notes.push(`No ${PATTERNS[p].label.toLowerCase()} work (${PATTERNS[p].hint}).`)
    })
    if (vol.pull > 0 && vol.push > vol.pull * 1.4) notes.push('Pushing clearly outweighs pulling. Add more pulls: rows, band pull-aparts, high pulls.')
    if (vol.push > 0 && vol.pull === 0) notes.push('There is pushing but no pulling. That is a shoulder imbalance.')
    if (vol.hinge > 0 && vol.squat > 0 && vol.hinge > vol.squat * 2.5) notes.push('Hinge work is much larger than squat work.')
    if (!notes.length) notes.push('The split looks even. Keep going and add reps gradually.')
  }

  return (
    <div className="screen">
      <h1>Balance</h1>
      <div className="seg">
        <button className={mode === 'program' ? 'on' : ''} onClick={() => setMode('program')}>
          My program
        </button>
        <button className={mode === 'history' ? 'on' : ''} onClick={() => setMode('history')}>
          Last 14 days
        </button>
      </div>

      {total === 0 ? (
        <p className="muted">{mode === 'history' ? 'No strength workouts in the last 14 days.' : 'No exercises are enabled in the program.'}</p>
      ) : (
        <>
          <div className="card">
            <ul className="bal">
              {BALANCE_PATTERNS.map((p) => (
                <li key={p}>
                  <div className="b-top">
                    <b>{PATTERNS[p].label}</b>
                    <span className="muted">{Math.round((vol[p] / total) * 100)}%</span>
                  </div>
                  <div className="b-track">
                    <i className={`t-${p}`} style={{ width: `${(vol[p] / max) * 100}%` }} />
                  </div>
                  <div className="muted cap">{PATTERNS[p].hint}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>Takeaways</h3>
            <ul className="plain notes">
              {notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
