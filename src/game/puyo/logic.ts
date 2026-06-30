import { COLS, ROWS, DIR_OFFSET, type Dir, type Cell, type Grid, type Piece, type PuyoState, createEmptyGrid } from './types'

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
