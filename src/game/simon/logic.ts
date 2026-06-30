import { type SimonState, type SimonPhase } from './types'

const TOTAL_ROUNDS = 4

export function createSimonState(): SimonState {
  return {
    sequence: [],
    playerIdx: 0,
    currentRound: 1,
    phase: 'showing',
    activeNote: null,
  }
}

export function generateSequence(state: SimonState): SimonState {
  const newSeq: number[] = []
  for (let i = 0; i < state.currentRound; i++) {
    newSeq.push(Math.floor(Math.random() * 4))
  }
  return { ...state, sequence: newSeq, playerIdx: 0, phase: 'showing', activeNote: null }
}

export function tapNote(state: SimonState, idx: number): SimonState {
  if (state.phase !== 'input') return state

  const expected = state.sequence[state.playerIdx]
  if (idx !== expected) {
    return { ...state, phase: 'wrong', activeNote: idx }
  }

  const nextPlayerIdx = state.playerIdx + 1
  if (nextPlayerIdx >= state.sequence.length) {
    // round complete
    const nextRound = state.currentRound + 1
    if (nextRound > TOTAL_ROUNDS) {
      return { ...state, playerIdx: nextPlayerIdx, phase: 'clear', activeNote: idx }
    }
    return { ...state, playerIdx: nextPlayerIdx, phase: 'correct', activeNote: idx }
  }

  return { ...state, playerIdx: nextPlayerIdx, phase: 'input', activeNote: idx }
}

export function canAdvance(state: SimonState): boolean {
  return state.phase === 'correct' || state.phase === 'wrong'
}

export function advance(state: SimonState): SimonState {
  if (state.phase === 'correct') {
    // next round
    const nextRound = state.currentRound + 1
    if (nextRound > TOTAL_ROUNDS) {
      return { ...state, phase: 'clear' }
    }
    return generateSequence({ ...state, currentRound: nextRound })
  }
  if (state.phase === 'wrong') {
    // retry same round
    return generateSequence({ ...state, phase: 'showing', playerIdx: 0 })
  }
  return state
}
