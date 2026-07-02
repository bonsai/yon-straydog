import { createPuyoState, movePiece, rotatePiece, hardDrop, tick } from './puyo/logic'
import { createCanvas, drawFrame } from './puyo/view'
import { STATION_EMOJIS } from './puyo/types'
import { completeCurrentSpot } from '../../hub'

let state = createPuyoState(0)
let animId: number | null = null
let keys: Set<string> = new Set()
let running = false
let delay = 0
let clearTimer = 0
const INTERVAL = 28

export function startPuyoGame(targetColor: number): void {
  const el = document.getElementById('puyo-game')
  const label = document.getElementById('puyo-station-label')
  if (!el) return; el.style.display = 'flex'
  const station = STATION_EMOJIS[targetColor]
  if (label) label.textContent = `${station.emoji} ${station.station}`
  state = createPuyoState(targetColor)
  const canvas = createCanvas()
  if (!canvas) return
  const wrap = document.getElementById('puyo-canvas')
  if (wrap) { wrap.innerHTML = ''; wrap.appendChild(canvas) }
  keys.clear(); delay = 0; clearTimer = 0; running = true
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  if (animId) cancelAnimationFrame(animId)
  const loop = () => {
    if (!running) return; delay++
    if (state.phase === 'playing') {
      if (keys.has('ArrowDown')) state = movePiece(state, 0)
      if (delay % 5 === 0) {
        if (keys.has('ArrowLeft')) state = movePiece(state, -1)
        else if (keys.has('ArrowRight')) state = movePiece(state, 1)
      }
      if (delay % INTERVAL === 0) state = tick(state)
    }
    if (state.phase === 'done') {
      clearTimer++
      if (clearTimer === 30) {
        closePuyoGame()
        return
      }
    }
    const ctx = canvas.getContext('2d')
    if (ctx) drawFrame(ctx, state)
    animId = requestAnimationFrame(loop)
  }
  animId = requestAnimationFrame(loop)
}

function onKeyDown(e: KeyboardEvent): void {
  keys.add(e.key)
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault()
  if (state.phase !== 'playing') return
  switch (e.key) {
    case 'ArrowLeft':  state = movePiece(state, -1); break
    case 'ArrowRight': state = movePiece(state, 1); break
    case 'ArrowUp':    state = rotatePiece(state); break
    case ' ':          state = hardDrop(state); break
    case 'Escape':     closePuyoGame(); break
  }
}
function onKeyUp(e: KeyboardEvent): void { keys.delete(e.key) }

export function closePuyoGame(): void {
  running = false
  const el = document.getElementById('puyo-game')
  if (el) el.style.display = 'none'
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  if (animId) { cancelAnimationFrame(animId); animId = null }
  if (state.phase === 'done') completeCurrentSpot()
}
