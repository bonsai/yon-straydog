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
