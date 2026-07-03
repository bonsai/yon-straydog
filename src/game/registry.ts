import { startPuyoGame } from './puyo'
import { startSimon } from './simon'
import { startQuiz4 } from './quiz'
import { createPuzzleState } from './puzzle'

export function registerGameStarters(target: Record<string, () => void>): void {
  Object.assign(target, {
    s0: () => startPuyoGame(0),
    s1: () => startSimon(),
    s2: () => startQuiz4(),
    s3: () => { /* final game - TBD */ },
    s4: () => {
      // Start puzzle game
      const state = createPuzzleState(true)
      // TODO: integrate with game loop or UI
    },
  })
}