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
  type: 'text' | 'action' | 'choice'
  text?: string
  action?: () => void
  nextPhase?: GamePhase
  auto?: boolean
  choiceId?: string
}

let currentPhase: GamePhase = 'title'
let stepQueue: Step[] = []
let currentStep = 0
let stepCompleteCallback: (() => void) | null = null

export function getPhase(): GamePhase {
  return currentPhase
}

export function setPhase(phase: GamePhase): void {
  currentPhase = phase
}

export function setSteps(steps: Step[], onComplete?: () => void): void {
  stepQueue = steps
  currentStep = 0
  stepCompleteCallback = onComplete ?? null
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
    stepCompleteCallback?.()
    stepQueue = []
    currentStep = 0
    stepCompleteCallback = null
  }
  return step
}

export function hasMoreSteps(): boolean {
  return currentStep < stepQueue.length
}

export function clearSteps(): void {
  stepQueue = []
  currentStep = 0
  stepCompleteCallback = null
}

export function buildIntroSteps(onDone: () => void): Step[] {
  return [
    { type: 'text', text: '壁のQRコードを読み取ると、そこには ひと組の夫妻の姿があった。', auto: true },
    { type: 'text', text: '「あの…すみません。うちの犬がいなくなってしまったんです。」', auto: true },
    { type: 'text', text: '「妻が妊娠中で、動けなくて…どうか…」', auto: true },
    { type: 'text', text: 'あなたは夫妻の代わりに、犬を探すことにした——', auto: true },
    { type: 'text', text: '夫妻は一枚の写真を差し出した。だが——写真は砕け散っている。', auto: true },
    { type: 'text', text: '元にもどせばなにかわかるかもしれない。', auto: true },
    { type: 'choice', text: 'パズルに挑戦しますか？', choiceId: 'intro_puzzle' },
    { type: 'action', action: onDone, nextPhase: 'puzzle' },
  ]
}

export function buildHintSteps(spotName: string, hint: string, onPlay: () => void): Step[] {
  return [
    { type: 'text', text: `📌 ${spotName} に向かおう`, auto: true },
    { type: 'text', text: hint, auto: true },
    { type: 'choice', text: '地図を開いて出発しますか？', choiceId: 'start_map' },
    { type: 'action', action: onPlay, nextPhase: 'play' },
  ]
}

export function buildStorySteps(icon: string, title: string, paragraphs: string[], onPlay: () => void, nextPhase: GamePhase, choiceText?: string): Step[] {
  const steps: Step[] = []
  for (const p of paragraphs) {
    if (p) steps.push({ type: 'text', text: p, auto: true })
  }
  steps.push({ type: 'choice', text: choiceText ?? 'ゲームをするかやめるか？', choiceId: 'play_or_quit' })
  steps.push({ type: 'action', action: onPlay, nextPhase })
  return steps
}
