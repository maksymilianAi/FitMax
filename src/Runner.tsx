import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EX } from './data'
import { Figure } from './figures'
import {
  amountText,
  beep,
  fmt,
  youtube,
  type HistoryEntry,
  type LogStep,
  type Section,
  type Step,
} from './lib'

const SECTION: Record<Step['section'], string> = {
  warmup: 'Warm-up',
  workout: 'Workout',
  cooldown: 'Cool-down',
  rest: 'Rest',
}

type Status = 'done' | 'skipped' | null

interface Props {
  steps: Step[]
  title: string
  onSave: (e: HistoryEntry) => void
  onClose: () => void
}

export function Runner({ steps, title, onSave, onClose }: Props) {
  const [idx, setIdx] = useState(0)
  const [status, setStatus] = useState<Status[]>(() => steps.map(() => null))
  const [remaining, setRemaining] = useState<number | null>(steps[0]?.unit === 'time' ? steps[0].amount : null)
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const started = useRef(Date.now())
  const saved = useRef(false)

  const step = steps[idx]
  const ex = step && step.exId !== 'rest' ? EX[step.exId] : null

  const enter = useCallback(
    (i: number) => {
      setIdx(i)
      const s = steps[i]
      setRemaining(s.unit === 'time' ? s.amount : null)
      setPaused(false)
    },
    [steps],
  )

  const buildEntry = useCallback((): HistoryEntry | null => {
    const log: LogStep[] = []
    steps.forEach((s, i) => {
      if (s.section === 'rest' || !status[i]) return
      log.push({
        exId: s.exId,
        section: s.section as Section,
        status: status[i] as 'done' | 'skipped',
        amount: s.amount,
        unit: s.unit,
        kg: s.kg,
        perSide: s.perSide,
      })
    })
    if (!log.some((l) => l.status === 'done')) return null
    return {
      id: String(Date.now()),
      date: new Date().toISOString(),
      title,
      seconds: Math.round((Date.now() - started.current) / 1000),
      log,
    }
  }, [steps, status, title])

  const advance = useCallback(
    (value: 'done' | 'skipped') => {
      if (finished) return
      setStatus((prev) => {
        const next = [...prev]
        next[idx] = value
        return next
      })
      if (idx >= steps.length - 1) setFinished(true)
      else enter(idx + 1)
    },
    [enter, finished, idx, steps.length],
  )

  const back = useCallback(() => {
    if (finished) {
      setFinished(false)
      return
    }
    if (idx === 0) return
    setStatus((prev) => {
      const next = [...prev]
      next[idx - 1] = null
      return next
    })
    enter(idx - 1)
  }, [enter, finished, idx])

  useEffect(() => {
    if (finished && !saved.current) {
      saved.current = true
      const e = buildEntry()
      if (e) onSave(e)
    }
  }, [finished, buildEntry, onSave])

  useEffect(() => {
    if (remaining === null || paused || finished) return
    if (remaining <= 0) return
    const t = setTimeout(() => {
      setRemaining((r) => {
        if (r === null) return r
        if (r - 1 <= 0) beep(988, 260)
        else if (r - 1 <= 3) beep(660, 90)
        return r - 1
      })
    }, 1000)
    return () => clearTimeout(t)
  }, [remaining, paused, finished])

  const exit = useCallback(() => {
    if (!saved.current) {
      const e = buildEntry()
      if (e) {
        saved.current = true
        onSave(e)
      }
    }
    onClose()
  }, [buildEntry, onClose, onSave])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (confirmExit) {
        if (e.key === 'Escape') setConfirmExit(false)
        return
      }
      if (e.code === 'Space' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        if (finished) exit()
        else advance('done')
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault()
        back()
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (!finished) advance('skipped')
      } else if (e.key === 'p' || e.key === 'P') {
        setPaused((p) => !p)
      } else if (e.key === 'Escape') {
        setConfirmExit(true)
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') e.preventDefault()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [advance, back, confirmExit, exit, finished])

  const skipped = useMemo(
    () => steps.filter((s, i) => status[i] === 'skipped' && s.section !== 'rest'),
    [steps, status],
  )
  const doneCount = steps.filter((s, i) => status[i] === 'done' && s.section !== 'rest').length

  if (finished) {
    const total = steps.filter((s) => s.section !== 'rest').length
    return (
      <div className="runner">
        <div className="done-wrap">
          <div className="done-mark" aria-hidden="true">
            ✓
          </div>
          <h1>Workout complete</h1>
          <p className="muted">
            {title} · {fmt(Math.round((Date.now() - started.current) / 1000))}
          </p>
          <div className="stats">
            <div>
              <b>{doneCount}</b>
              <span>done</span>
            </div>
            <div>
              <b>{skipped.length}</b>
              <span>skipped</span>
            </div>
            <div>
              <b>{Math.round((doneCount / Math.max(1, total)) * 100)}%</b>
              <span>completed</span>
            </div>
          </div>
          {skipped.length > 0 && (
            <div className="card">
              <h3>Skipped</h3>
              <ul className="plain">
                {skipped.map((s) => (
                  <li key={s.key}>
                    {EX[s.exId].name}
                    {s.sideNote ? ` · ${s.sideNote.toLowerCase()}` : ''}
                    {s.round ? ` · round ${s.round}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="row">
            <button className="btn ghost" onClick={back}>
              Back
            </button>
            <button className="btn primary big" onClick={exit}>
              Done
            </button>
          </div>
          <p className="hint">Saved to history</p>
        </div>
      </div>
    )
  }

  const next = steps[idx + 1]
  const nextName = next ? (next.exId === 'rest' ? 'Rest' : EX[next.exId].name) : 'Finish'
  const isTime = step.unit === 'time'
  const R = 92
  const C = 2 * Math.PI * R
  const frac = isTime && remaining !== null ? Math.max(0, remaining) / step.amount : 1

  return (
    <div className={`runner sec-${step.section}`}>
      <header className="r-head">
        <button className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Exit">
          ✕
        </button>
        <div className="r-title">
          <span className="chip sec">{SECTION[step.section]}</span>
          <span className="muted">
            {idx + 1} / {steps.length}
          </span>
        </div>
        <button className="icon-btn" onClick={() => setPaused((p) => !p)} aria-label="Pause">
          {paused ? '▶' : 'Ⅱ'}
        </button>
      </header>

      <div className="bars" aria-hidden="true">
        {steps.map((s, i) => (
          <i key={s.key} className={`${i < idx ? (status[i] === 'skipped' ? 'skip' : 'full') : i === idx ? 'now' : ''} s-${s.section}`} />
        ))}
      </div>

      <main className="r-main">
        {step.section === 'rest' ? (
          <div className="rest-ring">
            <svg viewBox="0 0 200 200">
              <circle className="ring-bg" cx="100" cy="100" r={R} />
              <circle
                className="ring-fg"
                cx="100"
                cy="100"
                r={R}
                strokeDasharray={C}
                strokeDashoffset={C * (1 - frac)}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="ring-text">
              <b>{fmt(remaining ?? 0)}</b>
              <span>rest · round {step.round} of {step.rounds}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="figwrap">
              <Figure id={ex?.figure} name={ex!.name} />
              {isTime && (
                <div className="timer-pill" data-low={remaining !== null && remaining <= 3}>
                  {fmt(remaining ?? 0)}
                </div>
              )}
            </div>
            <h1 className="ex-name">{ex!.name}</h1>
            {step.sideNote && <div className="side-note">{step.sideNote}</div>}
            <div className="amount">
              {isTime ? (remaining !== null && remaining > 0 ? 'Hold' : 'Time is up') : amountText(step)}
              {!isTime && <small>{step.perSide ? '' : ' reps'}</small>}
            </div>
            <div className="chips">
              {step.kg ? <span className="chip kg">{step.kg} kg</span> : <span className="chip">bodyweight</span>}
              {step.round && step.rounds ? (
                <span className="chip">
                  round {step.round} of {step.rounds}
                </span>
              ) : null}
              {ex!.gear && <span className="chip">{ex!.gear}</span>}
            </div>
            <p className="cue">{ex!.cue}</p>
            <a className="vid" href={youtube(ex!.video)} target="_blank" rel="noreferrer">
              How to · video
            </a>
          </>
        )}
      </main>

      <footer className="r-foot">
        <div className="up-next">
          Next: <b>{nextName}</b>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={back} disabled={idx === 0}>
            ← Back
          </button>
          <button className="btn ghost" onClick={() => advance('skipped')}>
            Skip
          </button>
          <button className="btn primary big" onClick={() => advance('done')}>
            {step.section === 'rest' ? 'Next' : 'Done'}
            <kbd>Space</kbd>
          </button>
        </div>
        <div className="keys">Space next · ← back · S skip · P pause · Esc exit</div>
      </footer>

      {paused && (
        <div className="overlay" onClick={() => setPaused(false)}>
          <div className="pause">
            <h2>Paused</h2>
            <p className="muted">Press P or tap to resume</p>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="overlay">
          <div className="dialog">
            <h2>Leave the workout?</h2>
            <p className="muted">What you have already done will be saved to history.</p>
            <div className="row">
              <button className="btn ghost" onClick={() => setConfirmExit(false)}>
                Stay
              </button>
              <button className="btn danger" onClick={exit}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
