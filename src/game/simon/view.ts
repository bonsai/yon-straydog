import { NOTES, type SimonState } from './types'

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
