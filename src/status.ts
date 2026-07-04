import { SpotId } from './story/spots';
import { INTRO_LINES } from './story/spots';

export type GamePhase = 'title' | 'intro' | 'puzzle' | 'hub' | 'hint' | 'play' | 'story' | 'complete';
export type AppScreen = 'intro' | 'puzzle4x4' | 'home' | 'map';

export interface UserPos {
  lat: number;
  lng: number;
}

export interface Step {
  type: 'text' | 'action' | 'choice';
  text?: string;
  action?: () => void;
  nextPhase?: GamePhase;
  auto?: boolean;
  choiceId?: string;
}

export interface SpotInfo {
  id: string;
  name: string;
  icon: string;
  hint: string;
}

export interface GameState {
  phase: GamePhase;
  steps: Step[];
  currentStep: number;
  stepCompleteCallback: (() => void) | null;
  introDone: boolean;
  completedSpots: SpotId[];
  currentSpot: SpotInfo | null;
  userPos: UserPos | null;
}

export interface GameActions {
  setPhase: (phase: GamePhase) => void;
  setSteps: (steps: Step[], onComplete?: () => void) => void;
  getCurrentStep: () => Step | null;
  advanceStep: () => Step | null;
  hasMoreSteps: () => boolean;
  clearSteps: () => void;
  setIntroDone: () => void;
  setCurrentSpot: (spot: SpotInfo | null) => void;
  setUserPos: (pos: UserPos | null) => void;
  completeSpot: (id: SpotId) => void;
  reset: () => void;
}

const initialState: GameState = {
  phase: 'title',
  steps: [],
  currentStep: 0,
  stepCompleteCallback: null,
  introDone: false,
  completedSpots: [],
  currentSpot: null,
  userPos: null,
};

const initialActions: GameActions = {
  setPhase(phase) {
    // implementation
  },
  setSteps(steps, onComplete) {
    // implementation
  },
  getCurrentStep() {
    // implementation
  },
  advanceStep() {
    // implementation
  },
  hasMoreSteps() {
    // implementation
  },
  clearSteps() {
    // implementation
  },
  setIntroDone() {
    // implementation
  },
  setCurrentSpot(spot) {
    // implementation
  },
  setUserPos(pos) {
    // implementation
  },
  completeSpot(id) {
    // implementation
  },
  reset() {
    // implementation
  },
};

export const useGameStore = {
  getState: () => ({ ...initialState, ...initialActions }),
  setState(partial: Partial<GameState>) {
    // implementation
  },
};

export function buildIntroSteps(onDone: () => void): Step[] {
  const steps: Step[] = [];
  for (const line of INTRO_LINES) {
    steps.push({ type: 'text', text: line.text, auto: true });
  }
  steps.push({ type: 'choice', text: 'パズルに挑戦しますか？', choiceId: 'intro_puzzle' });
  steps.push({ type: 'action', action: onDone, nextPhase: 'puzzle' });
  return steps;
}

export function buildHintSteps(spotName: string, hint: string, onPlay: () => void): Step[] {
  return [
    { type: 'text', text: `📌 ${spotName} に向かおう`, auto: true },
    { type: 'text', text: hint, auto: true },
    { type: 'choice', text: '地図を開いて出発しますか？', choiceId: 'start_map' },
    { type: 'action', action: onPlay, nextPhase: 'play' },
  ];
}

export function buildStorySteps(icon: string, title: string, paragraphs: string[], onPlay: () => void, nextPhase: GamePhase, choiceText?: string): Step[] {
  const steps: Step[] = [];
  for (const p of paragraphs) {
    if (p) steps.push({ type: 'text', text: p, auto: true });
  }
  steps.push({ type: 'choice', text: choiceText ?? 'ゲームをするかやめるか？', choiceId: 'play_or_quit' });
  steps.push({ type: 'action', action: onPlay, nextPhase: nextPhase });
  return steps;
}