import { type Option, none, some, match } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

export interface Tile {
  currentPos: number
  correctPos: number
}

export interface PuzzleState {
  tiles: Tile[]
  selectedIdx: Option<number>
  moves: number
}

const SIZE = 4

const createInitialTiles = (): Tile[] =>
  Array.from({ length: SIZE * SIZE }, (_, i) => ({ currentPos: i, correctPos: i }))

const shuffleTiles = (tiles: Tile[]): Tile[] => {
  const pos = tiles.map(t => t.currentPos)
  for (let i = pos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pos[i], pos[j]] = [pos[j], pos[i]]
  }
  if (pos.every((p, i) => p === i)) {
    [pos[0], pos[1]] = [pos[1], pos[0]]
  }
  return tiles.map((t, i) => ({ ...t, currentPos: pos[i] }))
}

export const createPuzzleState = (shuffled: boolean): PuzzleState =>
  pipe(
    createInitialTiles(),
    shuffled ? shuffleTiles : (t) => t,
    (tiles) => ({ tiles, selectedIdx: none as Option<number>, moves: 0 })
  )

const swapTiles = (tiles: Tile[], a: number, b: number): Tile[] => {
  const next = [...tiles]
  next[a] = { ...next[a], currentPos: tiles[b].currentPos }
  next[b] = { ...next[b], currentPos: tiles[a].currentPos }
  return next
}

export const isSolved = (state: PuzzleState): boolean =>
  state.tiles.every(t => t.currentPos === t.correctPos)

export const selectOrSwap = (state: PuzzleState, idx: number): PuzzleState =>
  pipe(
    state.selectedIdx,
    match(
      () => ({ ...state, selectedIdx: some(idx) }),
      (prev) => prev === idx
        ? { ...state, selectedIdx: none }
        : {
            tiles: swapTiles(state.tiles, prev, idx),
            selectedIdx: none,
            moves: state.moves + 1,
          }
    )
  )
