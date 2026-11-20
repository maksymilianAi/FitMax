export type Pattern = 'hinge' | 'squat' | 'push' | 'pull' | 'carry' | 'core' | 'mobility'
export type Kind = 'warmup' | 'strength' | 'cooldown'
export type FigureId =
  | 'snow-angel'
  | 'tib-raise'
  | 'wall-angel'
  | 'cat-cow'
  | 'bird-dog'
  | 'swing'
  | 'goblet-squat'
  | 'glute-bridge'
  | 'pushup'

export const PATTERNS: Record<Pattern, { label: string; hint: string }> = {
  hinge: { label: 'Hinge', hint: 'hips back: swings, deadlift, clean' },
  squat: { label: 'Squat', hint: 'goblet squat, lunges' },
  push: { label: 'Push', hint: 'overhead press, push-ups' },
  pull: { label: 'Pull', hint: 'rows, band pulls, high pull' },
  carry: { label: 'Carry', hint: 'farmer walk, suitcase carry' },
  core: { label: 'Core', hint: 'halo, dead bug, plank, TGU' },
  mobility: { label: 'Mobility', hint: 'warm-up and stretching' },
}

export const BALANCE_PATTERNS: Pattern[] = ['hinge', 'squat', 'push', 'pull', 'carry', 'core']

export interface Exercise {
  id: string
  name: string
  kind: Kind
  patterns: Pattern[]
  unit: 'reps' | 'time'
  amount: number
  sides: boolean
  level: 1 | 2 | 3
  kg: number | null
  cue: string
  figure?: FigureId
  video: string
  gear: string
}

type E = Omit<Exercise, 'level' | 'kg' | 'sides' | 'gear'> &
  Partial<Pick<Exercise, 'level' | 'kg' | 'sides' | 'gear'>>

const raw: E[] = [
  // warm-up
  { id: 'bounce', name: 'Light bounces', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 35, cue: 'Small soft bounces on the balls of your feet, shoulders relaxed.', video: 'rebounding bounce warm up', gear: 'no equipment' },
  { id: 'arm-swings', name: 'Arm swings', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 30, cue: 'Big loose swings, chest open.', video: 'arm swings warm up', gear: 'no equipment' },
  { id: 'golf-swings', name: 'Golf swings', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 30, cue: 'Rotate through the torso, let the arms follow, heels lift as you turn.', video: 'golf swing warm up mobility', gear: 'no equipment' },
  { id: 'wrist-circles', name: 'Wrist circles', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 10, sides: true, cue: 'Slow circles in both directions. Healthy wrists matter for kettlebells.', video: 'wrist mobility kettlebell warm up', gear: 'no equipment' },
  { id: 'cat-cow', name: 'Cat-cow', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 10, cue: 'Move through the whole spine, exhale as you round.', figure: 'cat-cow', video: 'cat cow exercise', gear: 'mat' },
  { id: 'quad-rotation', name: 'Quadruped thoracic rotation', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 5, sides: true, cue: 'Hand behind the head, rotate the chest toward the ceiling. Hips stay still.', video: 'quadruped thoracic rotation open book', gear: 'mat' },
  { id: 'wall-angel', name: 'Wall angel', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 12, level: 2, cue: 'Back, hips and elbows touch the wall. Slow, from W to Y.', figure: 'wall-angel', video: 'wall angels exercise', gear: 'wall' },
  { id: 'towel-rotation', name: 'Towel rotation', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 8, level: 3, cue: 'Wide towel grip, straight arms from thighs overhead and behind you.', video: 'shoulder dislocates with towel', gear: 'towel' },
  { id: 'snow-angel', name: 'Prone snow angel', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 10, sides: true, level: 3, cue: 'Face down, arms and chest off the floor the whole time. Shoulder blades down and together. Pass the pen hand to hand.', figure: 'snow-angel', video: 'prone snow angel exercise', gear: 'mat, pen' },
  { id: 'pull-apart', name: 'Band pull-apart', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 12, level: 3, cue: 'Pull the band apart at chest height, squeeze the shoulder blades without shrugging.', video: 'band pull apart', gear: 'resistance band' },
  { id: 'cossack', name: 'Cossack squat', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 5, sides: true, cue: 'Sink to one side, straight leg on its heel, chest up.', video: 'cossack squat', gear: 'no equipment' },
  { id: 'tib-raise', name: 'Tibialis raise', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 12, level: 2, cue: 'Back to the wall, heels forward. Toes up as high as you can, pause for a second.', figure: 'tib-raise', video: 'tibialis raise', gear: 'wall' },
  { id: 'hip-hinge-drill', name: 'Bodyweight hip hinge', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 8, cue: 'Hips back, flat spine, knees slightly bent. Feel the hamstrings load.', video: 'hip hinge drill', gear: 'no equipment' },
  { id: 'glute-bridge', name: 'Glute bridge', kind: 'warmup', patterns: ['mobility'], unit: 'reps', amount: 12, level: 2, cue: 'Lift with the glutes, not the lower back. Pause at the top.', figure: 'glute-bridge', video: 'glute bridge', gear: 'mat' },
  { id: 'bird-dog', name: 'Bird dog', kind: 'warmup', patterns: ['core', 'mobility'], unit: 'reps', amount: 8, sides: true, level: 2, cue: 'Opposite arm and leg, hips stay level. Reach long instead of lifting high.', figure: 'bird-dog', video: 'bird dog exercise', gear: 'mat' },

  // workout
  { id: 'swing', name: 'Kettlebell swing', kind: 'strength', patterns: ['hinge'], unit: 'reps', amount: 5, kg: 8, cue: 'Drive with the hips, not the arms. Bell floats to chest height, spine flat at the top.', figure: 'swing', video: 'kettlebell swing form', gear: 'kettlebell' },
  { id: 'goblet-squat', name: 'Goblet squat', kind: 'strength', patterns: ['squat'], unit: 'reps', amount: 5, kg: 8, cue: 'Bell at the chest, elbows between the knees, heels down.', figure: 'goblet-squat', video: 'goblet squat form', gear: 'kettlebell' },
  { id: 'row', name: 'Bent-over row', kind: 'strength', patterns: ['pull'], unit: 'reps', amount: 5, sides: true, kg: 8, cue: 'Flat back, elbow along the body, pull to the hip.', video: 'kettlebell bent over row', gear: 'kettlebell' },
  { id: 'ohp', name: 'Overhead press', kind: 'strength', patterns: ['push'], unit: 'reps', amount: 5, sides: true, kg: 8, cue: 'Glutes and core tight, bell travels straight up over the shoulder.', video: 'kettlebell overhead press', gear: 'kettlebell' },
  { id: 'clean', name: 'Clean', kind: 'strength', patterns: ['hinge', 'pull'], unit: 'reps', amount: 5, sides: true, kg: 8, cue: 'Keep the bell close, let it rotate around the hand instead of slamming the forearm.', video: 'kettlebell clean form', gear: 'kettlebell' },
  { id: 'pushup', name: 'Push-up', kind: 'strength', patterns: ['push', 'core'], unit: 'reps', amount: 5, kg: null, cue: 'One straight line from heels to head, elbows at about 45 degrees.', figure: 'pushup', video: 'push up form', gear: 'mat' },
  { id: 'halo', name: 'Kettlebell halo', kind: 'strength', patterns: ['core', 'push'], unit: 'reps', amount: 5, sides: true, kg: 8, cue: 'Circle the bell around the head, elbows close, ribs down.', video: 'kettlebell halo', gear: 'kettlebell' },
  { id: 'dead-bug', name: 'Dead bug', kind: 'strength', patterns: ['core'], unit: 'reps', amount: 5, sides: true, kg: null, cue: 'Lower back pressed into the floor, slowly lower opposite arm and leg.', video: 'dead bug exercise', gear: 'mat' },
  { id: 'curl', name: 'Biceps curl', kind: 'strength', patterns: ['pull'], unit: 'reps', amount: 5, kg: 8, cue: 'Elbows by your sides, no swinging.', video: 'kettlebell bicep curl', gear: 'kettlebell' },
  { id: 'triceps-ext', name: 'Triceps extension', kind: 'strength', patterns: ['push'], unit: 'reps', amount: 5, kg: 8, cue: 'Elbows pointing forward and still, only the forearms move.', video: 'kettlebell triceps extension', gear: 'kettlebell' },
  { id: 'pullover', name: 'Pullover', kind: 'strength', patterns: ['pull', 'core'], unit: 'reps', amount: 5, kg: 8, cue: 'Lying down, bell behind the head on straight arms, lower back stays down.', video: 'kettlebell pullover', gear: 'kettlebell' },
  { id: 'farmer-walk', name: 'Farmer walk', kind: 'strength', patterns: ['carry', 'core'], unit: 'time', amount: 30, kg: 20, cue: 'Shoulders down, torso tall, steady steps. 20 kg bell.', video: 'farmer carry kettlebell', gear: '20 kg kettlebell' },
  { id: 'plank', name: 'Plank', kind: 'strength', patterns: ['core'], unit: 'time', amount: 20, kg: null, cue: 'Elbows under shoulders, glutes tight, lower back does not sag.', video: 'plank form', gear: 'mat' },
  { id: 'tgu', name: 'Turkish get-up', kind: 'strength', patterns: ['core', 'push'], unit: 'reps', amount: 2, sides: true, kg: 8, cue: 'Eyes on the bell the whole time. Slow, pause at each stage.', video: 'turkish get up kettlebell', gear: 'kettlebell' },
  { id: 'rdl', name: 'Dumbbell RDL', kind: 'strength', patterns: ['hinge'], unit: 'reps', amount: 8, kg: 10, cue: 'Dumbbells slide down the thighs, hips back, flat spine.', video: 'dumbbell romanian deadlift', gear: 'dumbbells' },
  { id: 'floor-press', name: 'Dumbbell floor press', kind: 'strength', patterns: ['push'], unit: 'reps', amount: 8, kg: 10, cue: 'Elbows at 45 degrees, touch the floor lightly, do not bounce.', video: 'dumbbell floor press', gear: 'dumbbells' },
  { id: 'lunge', name: 'Goblet lunge', kind: 'strength', patterns: ['squat'], unit: 'reps', amount: 5, sides: true, kg: 8, cue: 'Step back, front knee over the foot, torso upright.', video: 'goblet reverse lunge', gear: 'kettlebell' },

  // cool-down
  { id: 'butterfly', name: 'Butterfly stretch', kind: 'cooldown', patterns: ['mobility'], unit: 'time', amount: 45, level: 2, cue: 'Soles together, flat back, reach the chest forward.', video: 'butterfly stretch', gear: 'mat' },
  { id: 'spinal-twist', name: 'Lying spinal twist', kind: 'cooldown', patterns: ['mobility'], unit: 'time', amount: 30, sides: true, cue: 'Shoulders on the floor, let the knees fall to one side, breathe deeply.', video: 'lying spinal twist', gear: 'mat' },
  { id: 'low-lunge', name: 'Low lunge', kind: 'cooldown', patterns: ['mobility'], unit: 'time', amount: 30, sides: true, level: 2, cue: 'Hips forward and down, chest open, tuck the pelvis slightly.', video: 'low lunge stretch', gear: 'mat' },
  { id: 'happy-baby', name: 'Happy baby', kind: 'cooldown', patterns: ['mobility'], unit: 'time', amount: 40, cue: 'Knees toward the armpits, lower back on the floor, rock gently.', video: 'happy baby pose', gear: 'mat' },
  { id: 'reverse-tabletop', name: 'Reverse tabletop', kind: 'cooldown', patterns: ['mobility'], unit: 'time', amount: 20, level: 3, cue: 'Knees bent, feet flat, chest up, head neutral. An easier reverse plank.', video: 'reverse tabletop exercise', gear: 'mat' },
  { id: 'legs-wall', name: 'Legs up the wall', kind: 'cooldown', patterns: ['mobility'], unit: 'time', amount: 120, cue: 'Lower back touches the floor, breathe slowly, relax.', video: 'legs up the wall pose', gear: 'wall, mat' },
]

export const EXERCISES: Exercise[] = raw.map((e) => ({
  level: 1,
  kg: null,
  sides: false,
  gear: '',
  ...e,
}))

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e])) as Record<string, Exercise>

export const WARMUP_ORDER = [
  'bounce',
  'arm-swings',
  'golf-swings',
  'wrist-circles',
  'cat-cow',
  'quad-rotation',
  'wall-angel',
  'towel-rotation',
  'snow-angel',
  'pull-apart',
  'cossack',
  'tib-raise',
  'hip-hinge-drill',
  'glute-bridge',
  'bird-dog',
]

export const MOBILITY_WARMUP = [
  'cat-cow',
  'quad-rotation',
  'wall-angel',
  'towel-rotation',
  'snow-angel',
  'tib-raise',
  'cossack',
]

export const COOLDOWN_ORDER = [
  'butterfly',
  'spinal-twist',
  'low-lunge',
  'happy-baby',
  'reverse-tabletop',
  'legs-wall',
]

export interface ProgramItem {
  id: string
  enabled: boolean
  reps: number
  kg: number | null
}

export interface Program {
  items: ProgramItem[]
  rounds: number
  rest: number
}

const on = ['swing', 'goblet-squat', 'row', 'ohp', 'clean', 'pushup', 'halo', 'dead-bug']
const off = ['curl', 'triceps-ext', 'pullover', 'farmer-walk']

export const DEFAULT_PROGRAM: Program = {
  rounds: 2,
  rest: 75,
  items: [...on.map((id) => ({ id, enabled: true })), ...off.map((id) => ({ id, enabled: false }))].map(
    ({ id, enabled }) => ({ id, enabled, reps: EX[id].amount, kg: EX[id].kg }),
  ),
}
