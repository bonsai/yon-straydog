// ============================================================================
// Types
// ============================================================================

export const NOTES = ['ド', 'レ', 'ミ', 'ソ'] as const
export type NoteName = typeof NOTES[number]

export type SimonPhase = 'showing' | 'input' | 'correct' | 'wrong' | 'clear'

export interface SimonState {
  sequence: number[]      // indices into NOTES (0-3), generated round by round
  playerIdx: number       // how many notes the player has correctly repeated
  currentRound: number    // 1-4
  phase: SimonPhase
  activeNote: number | null  // currently lit note during showing phase
}

// ============================================================================
// Logic
// ============================================================================

const TOTAL_ROUNDS = 4

export function createSimonState(): SimonState {
  return {
    sequence: [],
    playerIdx: 0,
    currentRound: 1,
    phase: 'showing',
    activeNote: null,
  }
}

export function generateSequence(state: SimonState): SimonState {
  const newSeq: number[] = []
  for (let i = 0; i < state.currentRound; i++) {
    newSeq.push(Math.floor(Math.random() * 4))
  }
  return { ...state, sequence: newSeq, playerIdx: 0, phase: 'showing', activeNote: null }
}

export function tapNote(state: SimonState, idx: number): SimonState {
  if (state.phase !== 'input') return state

  const expected = state.sequence[state.playerIdx]
  if (idx !== expected) {
    return { ...state, phase: 'wrong', activeNote: idx }
  }

  const nextPlayerIdx = state.playerIdx + 1
  if (nextPlayerIdx >= state.sequence.length) {
    // round complete
    const nextRound = state.currentRound + 1
    if (nextRound > TOTAL_ROUNDS) {
      return { ...state, playerIdx: nextPlayerIdx, phase: 'clear', activeNote: idx }
    }
    return { ...state, playerIdx: nextPlayerIdx, phase: 'correct', activeNote: idx }
  }

  return { ...state, playerIdx: nextPlayerIdx, phase: 'input', activeNote: idx }
}

export function canAdvance(state: SimonState): boolean {
  return state.phase === 'correct' || state.phase === 'wrong'
}

export function advance(state: SimonState): SimonState {
  if (state.phase === 'correct') {
    // next round
    const nextRound = state.currentRound + 1
    if (nextRound > TOTAL_ROUNDS) {
      return { ...state, phase: 'clear' }
    }
    return generateSequence({ ...state, currentRound: nextRound })
  }
  if (state.phase === 'wrong') {
    // retry same round
    return generateSequence({ ...state, phase: 'showing', playerIdx: 0 })
  }
  return state
}

// ============================================================================
// View
// ============================================================================

// Web Audio: 4 notes (C4, D4, E4, G4)
const FREQS = [261.63, 293.66, 329.63, 392.00]
const PAD_BG = '#1a1a2e'
const PAD_BORDER = '#333'
const PAD_ACTIVE = '#ffd700'

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

export function playNote(idx: number): void {
  const ctx = getAudioCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = FREQS[idx % FREQS.length]
  gain.gain.value = 0.3
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.5)
}

const PAD_SIZE = 64
const GAP = 8
const W = PAD_SIZE * 2 + GAP
const H = PAD_SIZE * 2 + GAP + 40

export function createSimonCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  c.style.width = W + 'px'
  c.style.height = H + 'px'
  return c
}

export function clickTest(e: { offsetX: number; offsetY: number }): number | null {
  const col = Math.floor(e.offsetX / (PAD_SIZE + GAP))
  const row = Math.floor(e.offsetY / (PAD_SIZE + GAP))
  if (col >= 0 && col < 2 && row >= 0 && row < 2) return row * 2 + col
  return null
}

export function drawSimon(ctx: CanvasRenderingContext2D, state: SimonState) {
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, W, H)

  for (let i = 0; i < 4; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = col * (PAD_SIZE + GAP)
    const y = row * (PAD_SIZE + GAP)
    const isActive = state.activeNote === i
    ctx.fillStyle = PAD_BG
    ctx.beginPath()
    const r = 8
    ctx.roundRect(x, y, PAD_SIZE, PAD_SIZE, r)
    ctx.fill()
    ctx.strokeStyle = isActive ? PAD_ACTIVE : PAD_BORDER
    ctx.lineWidth = isActive ? 2 : 1
    ctx.stroke()
    ctx.fillStyle = isActive ? PAD_ACTIVE : '#888'
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(NOTES[i], x + PAD_SIZE / 2, y + PAD_SIZE / 2)
  }

  const hudY = PAD_SIZE * 2 + GAP + 8
  ctx.fillStyle = '#ffd700'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`ラウンド ${state.currentRound}/${4}`, 4, hudY)
  ctx.fillText(`進み ${state.playerIdx}/${state.sequence.length}`, 120, hudY)

  if (state.phase === 'correct') {
    ctx.fillStyle = '#4caf50'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✓ 正解！タップで次へ', W / 2, H - 6)
  }
  if (state.phase === 'wrong') {
    ctx.fillStyle = '#ef5350'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('❌ もう一度！タップでリトライ', W / 2, H - 6)
  }
  if (state.phase === 'clear') {
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🎉 全ラウンドクリア！', W / 2, H / 2)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#aaa'
    ctx.fillText('Escで閉じる', W / 2, H / 2 + 24)
  }
}

// ============================================================================
// Game Controller
// ============================================================================

let state = createSimonState()
let animId: number | null = null
let showIdx = 0
let showTimer = 0
let running = false
let clearTimer = 0

export function startSimon(): void {
  const el = document.getElementById('simon-game')
  if (!el) return; el.style.display = 'flex'
  state = generateSequence(createSimonState())
  showIdx = 0; showTimer = 0; clearTimer = 0; running = true
  const canvas = createSimonCanvas()
  const wrap = document.getElementById('simon-canvas')
  if (wrap) { wrap.innerHTML = ''; wrap.appendChild(canvas) }
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const hit = clickTest({ offsetX: x, offsetY: y })
    if (hit === null) return
    if (state.phase === 'showing') return
    if (state.phase === 'correct' || state.phase === 'wrong') {
      state = advance(state); showIdx = 0; showTimer = 0; return
    }
    if (state.phase === 'clear') { closeSimon(); return }
    playNote(hit); state = tapNote(state, hit)
  })
  document.addEventListener('keydown', onKeyDown)
  if (animId) cancelAnimationFrame(animId)
  const loop = () => {
    if (!running) return
    if (state.phase === 'showing') {
      showTimer++
      if (showTimer === 1) {
        const noteIdx = state.sequence[showIdx]
        playNote(noteIdx); state = { ...state, activeNote: noteIdx }
      } else if (showTimer === 20) {
        state = { ...state, activeNote: null }; showIdx++; showTimer = 0
        if (showIdx >= state.sequence.length) state = { ...state, phase: 'input', activeNote: null }
      }
    }
    if (state.phase === 'clear') {
      clearTimer++
      if (clearTimer === 40) {
        closeSimon()
        return
      }
    }
    const ctx = canvas.getContext('2d')
    if (ctx) drawSimon(ctx, state)
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}
function onKeyDown(e: KeyboardEvent): void { if (e.key === 'Escape') closeSimon() }

export function closeSimon(): void {
  running = false
  const el = document.getElementById('simon-game')
  if (el) el.style.display = 'none'
  document.removeEventListener('keydown', onKeyDown)
  if (animId) { cancelAnimationFrame(animId); animId = null }
  if (state.phase === 'clear') completeCurrentSpot()
}

// ============================================================================
// External Dependencies
// ============================================================================

// Import from hub - will be available at runtime
declare function completeCurrentSpot(): void
