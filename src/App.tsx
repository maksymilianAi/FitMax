import { useCallback, useMemo, useState } from 'react'
import { Balance } from './Balance'
import { DEFAULT_PROGRAM, type Program } from './data'
import { HistoryScreen } from './HistoryScreen'
import { Home } from './Home'
import { buildSteps, sessionTitle, useStored, type HistoryEntry, type SessionSpec } from './lib'
import { Library } from './Library'
import { ProgramScreen } from './ProgramScreen'
import { Runner } from './Runner'

type Tab = 'home' | 'program' | 'library' | 'history' | 'balance'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'program', label: 'Program', icon: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'library', label: 'Exercises', icon: 'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12' },
  { id: 'history', label: 'History', icon: 'M12 7v5l3 2M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5' },
  { id: 'balance', label: 'Balance', icon: 'M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [program, setProgram] = useStored<Program>('fitmax.program', DEFAULT_PROGRAM)
  const [history, setHistory] = useStored<HistoryEntry[]>('fitmax.history', [])
  const [session, setSession] = useState<SessionSpec | null>(null)

  const steps = useMemo(() => (session ? buildSteps(session, program) : []), [session, program])
  const save = useCallback((e: HistoryEntry) => setHistory((h) => [e, ...h]), [setHistory])
  const close = useCallback(() => setSession(null), [])

  if (session) {
    return <Runner steps={steps} title={sessionTitle(session)} onSave={save} onClose={close} />
  }

  return (
    <div className="app">
      <div className="content">
        {tab === 'home' && <Home program={program} history={history} onStart={setSession} />}
        {tab === 'program' && <ProgramScreen program={program} setProgram={setProgram} />}
        {tab === 'library' && <Library />}
        {tab === 'history' && <HistoryScreen history={history} setHistory={setHistory} />}
        {tab === 'balance' && <Balance program={program} history={history} />}
      </div>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={t.icon} />
            </svg>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
