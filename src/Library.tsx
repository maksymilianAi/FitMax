import { useState } from 'react'
import { EXERCISES, PATTERNS, type Kind, type Pattern } from './data'
import { Figure } from './figures'
import { amountText, youtube } from './lib'

const KINDS: { id: Kind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'warmup', label: 'Warm-up' },
  { id: 'strength', label: 'Strength' },
  { id: 'cooldown', label: 'Cool-down' },
]

export function Library() {
  const [kind, setKind] = useState<Kind | 'all'>('all')
  const [pattern, setPattern] = useState<Pattern | 'all'>('all')
  const [open, setOpen] = useState<string | null>(null)

  const list = EXERCISES.filter((e) => (kind === 'all' || e.kind === kind) && (pattern === 'all' || e.patterns.includes(pattern)))

  return (
    <div className="screen">
      <h1>Exercises</h1>
      <div className="seg small scroll">
        {KINDS.map((k) => (
          <button key={k.id} className={kind === k.id ? 'on' : ''} onClick={() => setKind(k.id)}>
            {k.label}
          </button>
        ))}
      </div>
      <div className="seg small scroll">
        <button className={pattern === 'all' ? 'on' : ''} onClick={() => setPattern('all')}>
          All patterns
        </button>
        {(Object.keys(PATTERNS) as Pattern[]).map((p) => (
          <button key={p} className={pattern === p ? 'on' : ''} onClick={() => setPattern(p)}>
            {PATTERNS[p].label}
          </button>
        ))}
      </div>

      <div className="grid">
        {list.map((e) => (
          <article key={e.id} className={`ex-card ${open === e.id ? 'open' : ''}`} onClick={() => setOpen(open === e.id ? null : e.id)}>
            <div className="thumb">
              <Figure id={e.figure} name={e.name} />
            </div>
            <div className="ex-body">
              <b>{e.name}</b>
              <div className="muted cap">
                {amountText({ amount: e.amount, unit: e.unit, perSide: e.sides && e.unit === 'reps' })}
                {e.unit === 'reps' ? ' reps' : ''} {e.kg ? `· ${e.kg} kg` : ''}
              </div>
              <div className="tags">
                {e.patterns.map((p) => (
                  <span key={p} className={`tag t-${p}`}>
                    {PATTERNS[p].label}
                  </span>
                ))}
              </div>
              {open === e.id && (
                <div className="more">
                  <p>{e.cue}</p>
                  {e.gear && <p className="muted cap">Gear: {e.gear}</p>}
                  <a href={youtube(e.video)} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()}>
                    How to · video
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
