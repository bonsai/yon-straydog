// ============================================================================
// Types
// ============================================================================

export const COLS = 6
export const ROWS = 12
export const COLORS = ['🍓', '🍊', '🍋', '🍈', '💎', '🥛', '🍇'] as const
export type PuyoColor = typeof COLORS[number]

// Grid cell: null = empty, number = color index (0-6)
export type Cell = number | null
export type Grid = Cell[][]

// Piece: 2 puyos anchored at (row, col), partner at (row + dr, col + dc)
export type Dir = 0 | 1 | 2 | 3  // 0=up, 1=right, 2=down, 3=left

export const DIR_OFFSET: Record<Dir, [number, number]> = {
  0: [-1, 0],  // up
  1: [0, 1],   // right
  2: [1, 0],   // down
  3: [0, -1],  // left
}

export interface Piece {
  row: number
  col: number
  dir: Dir
  colors: [number, number]
}

export type GamePhase = 'playing' | 'clearing' | 'gameover' | 'done'

export interface PuyoState {
  grid: Grid
  piece: Piece | null
  score: number
  clearedGroups: number
  phase: GamePhase
  targetColor: number  // which color to collect this round
}

export function createEmptyGrid(): Grid {
  const g: Grid = []
  for (let r = 0; r < ROWS; r++) {
    g.push(new Array(COLS).fill(null))
  }
  return g
}

export const STATION_EMOJIS = [
  { station: '新御茶ノ水', emoji: '🍓', color: 0 },
  { station: '神田', emoji: '🍊', color: 1 },
  { station: '水道橋', emoji: '🍋', color: 2 },
  { station: '小川町', emoji: '🍈', color: 3 },
  { station: '竹橋', emoji: '💎', color: 4 },
  { station: '大手町', emoji: '🥛', color: 5 },
  { station: '九段下', emoji: '🍇', color: 6 },
]

// ============================================================================
// Logic
// ============================================================================

const GOAL_GROUPS = 3  // clear 3 groups of target color to pass

export function createPuyoState(targetColor: number): PuyoState {
  return {
    grid: createEmptyGrid(),
    piece: spawnPiece(targetColor),
    score: 0,
    clearedGroups: 0,
    phase: 'playing',
    targetColor,
  }
}

function randomColor(except?: number): number {
  let c: number
  do { c = Math.floor(Math.random() * 4) } while (c === except)
  return c
}

export function spawnPiece(colorsOffset?: number): Piece {
  const base = (colorsOffset ?? 0) % 4
  return {
    row: 0,
    col: Math.floor(COLS / 2),
    dir: 2,  // child below anchor (row+1)
    colors: [base, randomColor(base)],
  }
}

function getCell(grid: Grid, row: number, col: number): Cell {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return -1  // wall
  return grid[row][col]
}

function setCell(grid: Grid, row: number, col: number, val: Cell): void {
  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) grid[row][col] = val
}

function isFree(grid: Grid, row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row][col] === null
}

function pieceCells(piece: Piece): [[number, number], [number, number]] {
  const [dr, dc] = DIR_OFFSET[piece.dir]
  return [
    [piece.row, piece.col],
    [piece.row + dr, piece.col + dc],
  ]
}

function canPlace(grid: Grid, row: number, col: number): boolean {
  if (col < 0 || col >= COLS) return false
  if (row >= ROWS) return false
  if (row < 0) return true  // above grid is always OK
  return grid[row][col] === null
}

function pieceFits(grid: Grid, piece: Piece): boolean {
  const cells = pieceCells(piece)
  return cells.every(([r, c]) => canPlace(grid, r, c))
}

export function movePiece(state: PuyoState, dc: number): PuyoState {
  if (state.phase !== 'playing' || !state.piece) return state
  const moved: Piece = { ...state.piece, col: state.piece.col + dc }
  if (pieceFits(state.grid, moved)) {
    return { ...state, piece: moved }
  }
  return state
}

export function rotatePiece(state: PuyoState): PuyoState {
  if (state.phase !== 'playing' || !state.piece) return state
  const newDir = ((state.piece.dir + 1) % 4) as Dir
  const rotated: Piece = { ...state.piece, dir: newDir }
  if (pieceFits(state.grid, rotated)) {
    return { ...state, piece: rotated }
  }
  // wall kick: try left/right offset
  for (const off of [-1, 1]) {
    const kicked: Piece = { ...rotated, col: rotated.col + off }
    if (pieceFits(state.grid, kicked)) return { ...state, piece: kicked }
  }
  return state
}

export function hardDrop(state: PuyoState): PuyoState {
  if (state.phase !== 'playing' || !state.piece) return state
  let s = state
  while (s.phase === 'playing') {
    const next = gravityTick(s)
    if (next === s) break
    s = next
  }
  return lockPiece(s)
}

export function tick(state: PuyoState): PuyoState {
  if (state.phase !== 'playing') return state
  const afterGravity = gravityTick(state)
  if (afterGravity.piece !== state.piece) return afterGravity
  return lockPiece(afterGravity)
}

function lockPiece(state: PuyoState): PuyoState {
  if (!state.piece) return state
  const cells = pieceCells(state.piece)
  const newGrid = state.grid.map(r => [...r])
  for (const [r, c] of cells) {
    if (r < 0 || r >= ROWS) continue
    const colorIdx = r === state.piece.row ? state.piece.colors[0] : state.piece.colors[1]
    newGrid[r][c] = colorIdx
  }

  // game over: puyo locked at the very top (row 0)
  if (newGrid[0].some(c => c !== null)) {
    return { ...state, grid: newGrid, piece: null, phase: 'gameover' }
  }

  return processMatches({ ...state, grid: newGrid, piece: null })
}

function gravityTick(state: PuyoState): PuyoState {
  if (!state.piece) return state
  const moved: Piece = { ...state.piece, row: state.piece.row + 1 }
  if (pieceFits(state.grid, moved)) {
    return { ...state, piece: moved }
  }
  return state
}

function processMatches(state: PuyoState, chain?: number): PuyoState {
  const { grid, score } = state
  const visited: boolean[][] = grid.map(r => r.map(() => false))
  const toClear: [number, number][] = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const color = grid[r][c]
      if (color === null || visited[r][c]) continue

      const group: [number, number][] = []
      const queue: [number, number][] = [[r, c]]
      visited[r][c] = true

      while (queue.length) {
        const [cr, cc] = queue.pop()!
        group.push([cr, cc])

        for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          const nr = cr + dr, nc = cc + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && grid[nr][nc] === color) {
            visited[nr][nc] = true
            queue.push([nr, nc])
          }
        }
      }

      if (group.length >= 4) {
        toClear.push(...group)
        // score: +100 per puyo, x2 for chain
        const multiplier = chain ? Math.min(chain + 1, 4) : 1
      }
    }
  }

  if (toClear.length === 0) {
    // no more matches → spawn next piece
    return { ...state, piece: spawnPiece(), phase: 'playing' }
  }

  // clear matched puyos
  const newGrid = grid.map(r => [...r])
  let newCleared = state.clearedGroups
  for (const [r, c] of toClear) {
    if (newGrid[r][c] !== null) {
      // count groups of target color
      newGrid[r][c] = null
      if (grid[r][c] === state.targetColor) {
        // count unique clears of target color
        // simplified: count per-puyo, need 4 for one group
      }
    }
  }
  const groupCount = Math.floor(toClear.length / 4)
  if (groupCount > 0) newCleared += groupCount

  const newScore = score + toClear.length * 10 * ((chain ?? 0) + 1)

  // apply gravity
  const settledGrid = applyGravity(newGrid)

  // check for chains
  const nextChain = (chain ?? 0) + 1
  const newState = { ...state, grid: settledGrid, score: newScore, clearedGroups: newCleared, phase: 'clearing' as const }

  // check completion
  if (newCleared >= GOAL_GROUPS) {
    return { ...newState, phase: 'done', piece: null }
  }

  // recurse for chains
  return processMatches(newState, nextChain)
}

function applyGravity(grid: Grid): Grid {
  const newGrid = grid.map(r => [...r])
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newGrid[r][c] !== null) {
        if (r !== writeRow) {
          newGrid[writeRow][c] = newGrid[r][c]
          newGrid[r][c] = null
        }
        writeRow--
      }
    }
  }
  return newGrid
}

// ============================================================================
// View
// ============================================================================

export function createCanvasSize(): { cell: number, w: number, h: number } {
  const vw = Math.min(window.innerWidth, 400)
  const cell = Math.floor((vw - 24) / COLS)
  const w = cell * COLS + 8
  const h = cell * ROWS + 8 + 32
  return { cell, w, h }
}

export function createCanvas(): HTMLCanvasElement | null {
  const { cell, w, h } = createCanvasSize()
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.style.width = w + 'px'
  c.style.height = h + 'px'
  return c
}

function drawCell(ctx: CanvasRenderingContext2D, col: number, row: number, colorIdx: number | null, alpha: number, cell: number) {
  const x = 4 + col * cell
  const y = 4 + row * cell
  ctx.globalAlpha = alpha

  if (colorIdx === null) {
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(x, y, cell - 1, cell - 1)
    ctx.globalAlpha = 1
    return
  }

  ctx.font = `${cell - 4}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(COLORS[colorIdx % COLORS.length], x + (cell - 1) / 2, y + (cell - 1) / 2 + 1)
  ctx.globalAlpha = 1
}

export function drawFrame(ctx: CanvasRenderingContext2D, state: PuyoState) {
  const { cell, w, h } = createCanvasSize()
  const { grid, piece, score, clearedGroups, targetColor } = state

  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#111122'
  ctx.fillRect(3, 3, cell * COLS + 2, cell * ROWS + 2)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      drawCell(ctx, c, r, grid[r][c], 1, cell)
    }
  }

  if (piece && state.phase === 'playing') {
    const ghostRow = computeGhostRow(grid, piece)
    const ghostPiece: Piece = { ...piece, row: ghostRow }
    const cells = pieceCells(ghostPiece)
    for (const [r, c] of cells) {
      const ci = r === ghostRow ? piece.colors[0] : piece.colors[1]
      drawCell(ctx, c, r, ci, 0.2, cell)
    }
  }

  if (piece && state.phase === 'playing') {
    const cells = pieceCells(piece)
    for (const [r, c] of cells) {
      const ci = r === piece.row ? piece.colors[0] : piece.colors[1]
      drawCell(ctx, c, r, ci, 0.9, cell)
    }
  }

  const hudY = cell * ROWS + 10
  ctx.fillStyle = '#ffd700'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`得点: ${score}`, 4, hudY)
  ctx.fillText(`目標: ${COLORS[targetColor % COLORS.length]} x${Math.max(0, 3 - clearedGroups)}`, w / 2 + 4, hudY)

  if (state.phase === 'done') {
    ctx.fillStyle = 'rgba(10,10,15,0.7)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#4caf50'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✓ クリア！', w / 2, h / 2 - 10)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#aaa'
    ctx.fillText('Escで閉じる', w / 2, h / 2 + 16)
  }
  if (state.phase === 'gameover') {
    ctx.fillStyle = 'rgba(10,10,15,0.7)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ef5350'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', w / 2, h / 2)
  }
}

function computeGhostRow(grid: (number | null)[][], piece: Piece): number {
  let row = piece.row
  while (true) {
    const next: Piece = { ...piece, row: row + 1 }
    if (!pieceFits(grid, next)) break
    row++
  }
  return row
}

// ============================================================================
// Game Controller
// ============================================================================

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

// ============================================================================
// External Dependencies
// ============================================================================

// Import from hub - will be available at runtime
declare function completeCurrentSpot(): void
