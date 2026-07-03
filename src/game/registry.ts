import { startPuyoGame } from './puyo'
import { startSimon } from './simon'
import { startQuiz4 } from './quiz'
import { PuzzleStarter } from './puzzle-starter'

export function registerGameStarters(target: Record<string, () => void>): void {
  Object.assign(target, {
    s0: () => PuzzleStarter(),
    s1: () => startPuyoGame(0),
    s2: () => startSimon(),
    s3: () => startQuiz4(),
  })
}
