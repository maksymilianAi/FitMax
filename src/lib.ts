import { useEffect, useState } from 'react'
import { COOLDOWN_ORDER, EX, MOBILITY_WARMUP, WARMUP_ORDER, type Exercise, type Program } from './data'

export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? (JSON.parse(s) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable */
    }
  }, [key, value])
  return [value, setValue] as const
}

export type Section = 'warmup' | 'workout' | 'cooldown'

export interface SessionSpec {
  warmup: 0 | 1 | 2 | 3
  workout: boolean
  cooldown: boolean
  mobility: boolean
}

export interface Step {
  key: string
  section: Section | 'rest'
  exId: string
  unit: 'reps' | 'time'
  amount: number
  kg: number | null
  sideNote?: string
  perSide: boolean
  round?: number
  rounds?: number
}

const CD_STANDARD = (e: Exercise) => e.level <= 2

export function buildSteps(spec: SessionSpec, program: Program): Step[] {
  const steps: Step[] = []
  const add = (section: Section, e: Exercise, amount: number, kg: number | null, round?: number, rounds?: number) => {
    const base = { section, exId: e.id, unit: e.unit, kg, round, rounds }
    if (e.unit === 'time' && e.sides) {
      steps.push({ ...base, key: `${steps.length}`, amount, perSide: false, sideNote: 'Left side' })
      steps.push({ ...base, key: `${steps.length}`, amount, perSide: false, sideNote: 'Right side' })
    } else {
      steps.push({ ...base, key: `${steps.length}`, amount, perSide: e.sides && e.unit === 'reps' })
    }
  }

  if (spec.mobility) {
    MOBILITY_WARMUP.forEach((id) => add('warmup', EX[id], EX[id].amount, null))
  } else if (spec.warmup > 0) {
    WARMUP_ORDER.map((id) => EX[id])
      .filter((e) => e.level <= spec.warmup)
      .forEach((e) => add('warmup', e, e.amount, null))
  }

  if (spec.workout) {
    const items = program.items.filter((i) => i.enabled)
    for (let r = 1; r <= program.rounds; r++) {
      items.forEach((i) => add('workout', EX[i.id], i.reps, i.kg, r, program.rounds))
      if (r < program.rounds) {
        steps.push({
          key: `${steps.length}`,
          section: 'rest',
          exId: 'rest',
          unit: 'time',
          amount: program.rest,
          kg: null,
          perSide: false,
          round: r,
          rounds: program.rounds,
        })
      }
    }
  }

  if (spec.cooldown || spec.mobility) {
    COOLDOWN_ORDER.map((id) => EX[id])
      .filter((e) => spec.mobility || CD_STANDARD(e))
      .forEach((e) => add('cooldown', e, e.amount, null))
  }
  return steps
}

export function stepSeconds(s: Step) {
  if (s.unit === 'time') return s.amount
  const e = EX[s.exId]
  return Math.max(15, s.amount * (e?.sides ? 2 : 1) * 3)
}

export function estimateMinutes(steps: Step[]) {
  return Math.max(1, Math.round(steps.reduce((a, s) => a + stepSeconds(s) + 8, 0) / 60))
}

export function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.max(0, Math.floor(sec % 60))
  return `${m}:${String(s).padStart(2, '0')}`
}

export interface LogStep {
  exId: string
  section: Section
  status: 'done' | 'skipped'
  amount: number
  unit: 'reps' | 'time'
  kg: number | null
  perSide: boolean
}

export interface HistoryEntry {
  id: string
  date: string
  title: string
  seconds: number
  log: LogStep[]
}

export function sessionTitle(spec: SessionSpec) {
  if (spec.mobility) return 'Mobility day'
  const parts: string[] = []
  if (spec.warmup) parts.push('warm-up')
  if (spec.workout) parts.push('workout')
  if (spec.cooldown) parts.push('cool-down')
  const t = parts.join(' + ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function amountText(s: { amount: number; unit: 'reps' | 'time'; perSide: boolean }) {
  if (s.unit === 'time') return fmt(s.amount)
  return `${s.amount}${s.perSide ? ' each side' : ''}`
}

export function beep(freq = 880, ms = 160) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = freq
    g.gain.value = 0.08
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    setTimeout(() => {
      o.stop()
      ctx.close()
    }, ms)
    navigator.vibrate?.(120)
  } catch {
    /* no sound */
  }
}

export const youtube = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
