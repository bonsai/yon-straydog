import { createSimonState, generateSequence, tapNote, advance } from './simon/logic'
import { createSimonCanvas, drawSimon, playNote, clickTest } from './simon/view'
import { completeCurrentSpot } from './hub'

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
  if (animId) { cancelAnimationFrame(animId); animId = null }
  if (state.phase === 'clear') completeCurrentSpot()
}
