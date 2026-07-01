export type GamePhase =
  | 'title'
  | 'intro'
  | 'puzzle'
  | 'hub'
  | 'hint'
  | 'play'
  | 'story'
  | 'complete'

export interface Step {
  type: 'text' | 'action'
  text?: string
  action?: () => void
  nextPhase?: GamePhase
}

let currentPhase: GamePhase = 'title'
let stepQueue: Step[] = []
let currentStep = 0

export function getPhase(): GamePhase {
  return currentPhase
}

export function setPhase(phase: GamePhase): void {
  currentPhase = phase
}

export function setSteps(steps: Step[]): void {
  stepQueue = steps
  currentStep = 0
}

export function getCurrentStep(): Step | null {
  return stepQueue[currentStep] ?? null
}

export function advanceStep(): Step | null {
  currentStep++
  const step = stepQueue[currentStep] ?? null
  if (!step && stepQueue.length > 0) {
    const last = stepQueue[stepQueue.length - 1]
    if (last.nextPhase) setPhase(last.nextPhase)
    stepQueue = []
    currentStep = 0
  }
  return step
}

export function hasMoreSteps(): boolean {
  return currentStep < stepQueue.length
}

export function clearSteps(): void {
  stepQueue = []
  currentStep = 0
}

export function buildIntroSteps(onDone: () => void): Step[] {
  return [
    { type: 'text', text: '壁のQRコードを読み取ると、そこには ひと組の夫妻の姿があった。' },
    { type: 'text', text: '「あの…すみません。うちの犬がいなくなってしまったんです。」' },
    { type: 'text', text: '「妻が妊娠中で、動けなくて…どうか…」' },
    { type: 'text', text: 'あなたは夫妻の代わりに、犬を探すことにした——' },
    { type: 'text', text: '夫妻は一枚の写真を差し出した。だが——写真は砕け散っている。' },
    { type: 'text', text: '元に戻せば、なにかがわかる。' },
    { type: 'action', action: onDone, nextPhase: 'puzzle' },
  ]
}

export function buildHintSteps(spotName: string, hint: string, onDone: () => void): Step[] {
  return [
    { type: 'text', text: `📌 ${spotName} に向かおう` },
    { type: 'text', text: hint },
    { type: 'action', action: onDone, nextPhase: 'play' },
  ]
}

export function buildStorySteps(icon: string, title: string, paragraphs: string[], onDone: () => void, nextPhase: GamePhase): Step[] {
  const steps: Step[] = []
  for (const p of paragraphs) {
    if (p) steps.push({ type: 'text', text: p })
  }
  steps.push({ type: 'action', action: onDone, nextPhase })
  return steps
}
