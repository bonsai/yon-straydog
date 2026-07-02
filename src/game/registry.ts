import { startPuyoGame } from './puyo/puyo-game'
import { startSimon } from './simon/simon-game'
import { startQuiz4 } from './quiz/quiz4-game'

export function registerGameStarters(target: Record<string, () => void>): void {
  Object.assign(target, {
    s0: () => startPuyoGame(0),
    s1: () => startSimon(),
    s2: () => startQuiz4(),
  })
}
