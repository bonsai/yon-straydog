export const NOTES = ['ド', 'レ', 'ミ', 'ソ'] as const
export type NoteName = typeof NOTES[number]

export type SimonPhase = 'showing' | 'input' | 'correct' | 'wrong' | 'clear'

export interface SimonState {
  sequence: number[]      // indices into NOTES (0-3), generated round by round
  playerIdx: number       // how many notes the player has correctly repeated
  currentRound: number    // 1-4
  phase: SimonPhase
  activeNote: number | null  // currently lit note during showing phase
}
