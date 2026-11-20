import type { ReactNode } from 'react'
import type { FigureId } from './data'

const EASE = '0.4 0 0.6 1'
const times = (n: number) => Array.from({ length: n + 1 }, (_, i) => (i / n).toFixed(3)).join(';')
const splines = (n: number) => Array(n).fill(EASE).join(';')
const cyc = (f: string[]) => [...f, f[0]].join(';')

function Anim({ attr, frames, dur }: { attr: string; frames: string[]; dur: number }) {
  return (
    <animate
      attributeName={attr}
      dur={`${dur}s`}
      repeatCount="indefinite"
      calcMode="spline"
      keyTimes={times(frames.length)}
      keySplines={splines(frames.length)}
      values={cyc(frames)}
    />
  )
}

function P({ frames, dur = 3, cls = 's' }: { frames: string[]; dur?: number; cls?: 's' | 'm' }) {
  return (
    <polyline className={cls} points={frames[0]}>
      {frames.length > 1 && <Anim attr="points" frames={frames} dur={dur} />}
    </polyline>
  )
}

function C({ frames, r, dur = 3, cls = 's' }: { frames: [number, number][]; r: number; dur?: number; cls?: 's' | 'f' }) {
  return (
    <circle className={cls} r={r} cx={frames[0][0]} cy={frames[0][1]}>
      {frames.length > 1 && <Anim attr="cx" frames={frames.map((f) => String(f[0]))} dur={dur} />}
      {frames.length > 1 && <Anim attr="cy" frames={frames.map((f) => String(f[1]))} dur={dur} />}
    </circle>
  )
}

function Rot({ values, dur, children }: { values: string[]; dur: number; children: ReactNode }) {
  return (
    <g>
      {children}
      <animateTransform
        attributeName="transform"
        type="rotate"
        dur={`${dur}s`}
        repeatCount="indefinite"
        calcMode="spline"
        keyTimes={times(values.length)}
        keySplines={splines(values.length)}
        values={cyc(values)}
      />
    </g>
  )
}

const floor = <line className="fl" x1="14" y1="172" x2="186" y2="172" />

function Svg({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg className="fig" viewBox="0 0 200 200" role="img" aria-label={label}>
      {children}
    </svg>
  )
}

const FIGURES: Record<FigureId, () => ReactNode> = {
  'snow-angel': () => (
    <Svg label="Prone snow angel, top view">
      <rect className="mat" x="56" y="14" width="88" height="176" rx="8" />
      <circle className="s" cx="100" cy="38" r="13" />
      <rect className="s" x="84" y="56" width="32" height="70" rx="12" />
      <line className="s" x1="92" y1="126" x2="92" y2="188" />
      <line className="s" x1="108" y1="126" x2="108" y2="188" />
      <Rot values={['65 84 66', '-75 84 66']} dur={3.2}>
        <line className="m" x1="84" y1="66" x2="29" y2="66" />
        <circle className="f" cx="26" cy="66" r="5" />
      </Rot>
      <Rot values={['-65 116 66', '75 116 66']} dur={3.2}>
        <line className="m" x1="116" y1="66" x2="171" y2="66" />
        <circle className="f" cx="174" cy="66" r="5" />
      </Rot>
    </Svg>
  ),
  'tib-raise': () => (
    <Svg label="Tibialis raise, side view">
      {floor}
      <line className="wall" x1="36" y1="24" x2="36" y2="172" />
      <circle className="s" cx="52" cy="30" r="12" />
      <polyline className="s" points="50,46 46,100 58,135 66,166" />
      <ellipse className="f mu" cx="68" cy="140" rx="5" ry="16">
        <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0.15;0.9;0.15" />
      </ellipse>
      <Rot values={['0 62 168', '-28 62 168']} dur={2.4}>
        <line className="m" x1="62" y1="168" x2="106" y2="168" />
      </Rot>
    </Svg>
  ),
  'wall-angel': () => (
    <Svg label="Wall angel, front view">
      <rect className="mat" x="30" y="0" width="140" height="200" />
      <circle className="s" cx="100" cy="38" r="13" />
      <line className="s" x1="82" y1="68" x2="118" y2="68" />
      <line className="s" x1="100" y1="52" x2="100" y2="130" />
      <line className="s" x1="100" y1="130" x2="88" y2="192" />
      <line className="s" x1="100" y1="130" x2="112" y2="192" />
      <P cls="m" dur={3.2} frames={['82,68 52,98 46,64', '82,68 60,40 48,10']} />
      <P cls="m" dur={3.2} frames={['118,68 148,98 154,64', '118,68 140,40 152,10']} />
    </Svg>
  ),
  'cat-cow': () => (
    <Svg label="Cat-cow, side view">
      {floor}
      <line className="s" x1="75" y1="100" x2="75" y2="170" />
      <line className="s" x1="130" y1="100" x2="130" y2="170" />
      <P cls="m" dur={3.4} frames={['75,100 90,90 102,86 114,90 130,100', '75,100 90,110 102,114 114,110 130,100']} />
      <C dur={3.4} r={11} frames={[[146, 108], [148, 90]]} />
    </Svg>
  ),
  'bird-dog': () => (
    <Svg label="Bird dog, side view">
      {floor}
      <line className="s" x1="130" y1="100" x2="130" y2="170" />
      <polyline className="s" points="75,100 75,170 42,170" />
      <line className="s" x1="75" y1="100" x2="130" y2="100" />
      <P cls="m" dur={3.4} frames={['130,100 132,134 134,170', '130,100 162,100 192,100']} />
      <P cls="m" dur={3.4} frames={['75,100 75,135 75,170', '75,100 52,100 30,100']} />
      <circle className="s" cx="148" cy="94" r="10" />
    </Svg>
  ),
  swing: () => (
    <Svg label="Kettlebell swing, side view">
      {floor}
      <P dur={2} frames={['100,170 90,140 70,108 122,80', '100,170 100,140 100,105 100,52']} />
      <C dur={2} r={12} frames={[[134, 70], [100, 36]]} />
      <P cls="m" dur={2} frames={['122,80 84,126', '100,54 150,56']} />
      <C cls="f" dur={2} r={10} frames={[[80, 134], [160, 58]]} />
    </Svg>
  ),
  'goblet-squat': () => (
    <Svg label="Goblet squat, side view">
      {floor}
      <P dur={2.6} frames={['100,170 100,138 100,104 100,52', '100,170 134,140 90,130 104,84']} />
      <C dur={2.6} r={12} frames={[[100, 36], [108, 68]]} />
      <P cls="m" dur={2.6} frames={['100,54 118,74', '104,86 122,100']} />
      <C cls="f" dur={2.6} r={9} frames={[[122, 80], [126, 104]]} />
    </Svg>
  ),
  'glute-bridge': () => (
    <Svg label="Glute bridge, side view">
      {floor}
      <circle className="s" cx="44" cy="158" r="11" />
      <line className="s" x1="60" y1="166" x2="108" y2="166" />
      <P dur={2.6} frames={['60,166 108,166 144,124 152,170', '60,166 108,130 146,118 152,170']} />
    </Svg>
  ),
  pushup: () => (
    <Svg label="Push-up, side view">
      {floor}
      <P dur={2.2} frames={['44,164 140,110', '44,164 140,150']} />
      <P cls="m" dur={2.2} frames={['140,110 141,140 142,170', '140,150 122,160 142,170']} />
      <C dur={2.2} r={11} frames={[[156, 100], [158, 138]]} />
    </Svg>
  ),
}

export function hasFigure(id?: FigureId) {
  return !!id && id in FIGURES
}

export function Figure({ id, name }: { id?: FigureId; name: string }) {
  if (id && FIGURES[id]) return <>{FIGURES[id]()}</>
  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <svg className="fig" viewBox="0 0 200 200" role="img" aria-label={name}>
      <circle className="mat" cx="100" cy="100" r="62" />
      <text x="100" y="116" textAnchor="middle" className="mono">
        {letters}
      </text>
    </svg>
  )
}
