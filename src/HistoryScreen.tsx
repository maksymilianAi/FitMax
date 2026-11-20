import { useRef, useState } from 'react'
import { EX } from './data'
import { amountText, fmt, type HistoryEntry } from './lib'

function weeks(history: HistoryEntry[], n = 8) {
  const out: { label: string; count: number }[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  now.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  for (let i = n - 1; i >= 0; i--) {
    const from = new Date(now)
    from.setDate(from.getDate() - i * 7)
    const to = new Date(from)
    to.setDate(to.getDate() + 7)
    out.push({
      label: from.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' }),
      count: history.filter((h) => {
        const t = new Date(h.date).getTime()
        return t >= from.getTime() && t < to.getTime()
      }).length,
    })
  }
  return out
}

export function HistoryScreen({ history, setHistory }: { history: HistoryEntry[]; setHistory: (h: HistoryEntry[]) => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const w = weeks(history)
  const max = Math.max(3, ...w.map((x) => x.count))

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fitmax-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as HistoryEntry[]
      if (!Array.isArray(data)) throw new Error()
      const ids = new Set(history.map((h) => h.id))
      const merged = [...history, ...data.filter((d) => d && d.id && !ids.has(d.id))]
      merged.sort((a, b) => b.date.localeCompare(a.date))
      setHistory(merged)
    } catch {
      alert('Could not read that file')
    }
  }

  return (
    <div className="screen">
      <h1>History</h1>

      <div className="card">
        <h3>Workouts per week</h3>
        <svg viewBox="0 0 320 110" className="bars-chart" role="img" aria-label="Workouts per week chart">
          {w.map((x, i) => {
            const h = (x.count / max) * 64
            return (
              <g key={i}>
                <rect x={i * 40 + 8} y={78 - h} width="24" height={Math.max(h, 2)} rx="5" className={x.count ? 'bar on' : 'bar'} />
                {x.count > 0 && (
                  <text x={i * 40 + 20} y={70 - h} textAnchor="middle" className="bar-n">
                    {x.count}
                  </text>
                )}
                <text x={i * 40 + 20} y="100" textAnchor="middle" className="bar-l">
                  {x.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {history.length === 0 && <p className="muted">Nothing here yet. Your first workout will show up here.</p>}

      <ul className="hlist">
        {history.map((h) => {
          const done = h.log.filter((l) => l.status === 'done')
          const skipped = h.log.filter((l) => l.status === 'skipped')
          const isOpen = open === h.id
          return (
            <li key={h.id}>
              <button className="h-row" onClick={() => setOpen(isOpen ? null : h.id)}>
                <div>
                  <b>{h.title}</b>
                  <div className="muted cap">
                    {new Date(h.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' })} · {fmt(h.seconds)}
                  </div>
                </div>
                <div className="h-badges">
                  <span className="tag ok">{done.length}</span>
                  {skipped.length > 0 && <span className="tag warn">−{skipped.length}</span>}
                </div>
              </button>
              {isOpen && (
                <ul className="h-detail">
                  {h.log.map((l, i) => (
                    <li key={i} className={l.status}>
                      <span>{EX[l.exId]?.name ?? l.exId}</span>
                      <span className="muted">
                        {l.status === 'skipped' ? 'skipped' : `${amountText(l)}${l.kg ? ` · ${l.kg} kg` : ''}`}
                      </span>
                    </li>
                  ))}
                  <li className="del">
                    <button className="link danger" onClick={() => confirm('Delete this entry?') && setHistory(history.filter((x) => x.id !== h.id))}>
                      Delete entry
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      <div className="row">
        <button className="btn ghost" onClick={exportJson} disabled={!history.length}>
          Export JSON
        </button>
        <button className="btn ghost" onClick={() => file.current?.click()}>
          Import
        </button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
      </div>
    </div>
  )
}
