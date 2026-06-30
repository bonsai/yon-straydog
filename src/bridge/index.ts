import type { Spot } from '../game/spots'
import type { StoryScene } from '../story/data'

// =====================================================
// Story → Bridge events
// =====================================================
export type StoryEvent =
  | { type: 'intro_finished' }
  | { type: 'scene_advanced'; sceneId: number }
  | { type: 'story_closed' }

// =====================================================
// Game → Bridge events
// =====================================================
export type GameEvent =
  | { type: 'spot_solved'; spotId: string }
  | { type: 'puzzle4x4_done' }
  | { type: 'all_spots_complete' }
  | { type: 'gps_arrived'; spotId: string }

// =====================================================
// Bridge → Story actions
// =====================================================
export type StoryAction =
  | { type: 'advance' }
  | { type: 'show_scene'; id: number }
  | { type: 'show_intro' }
  | { type: 'reset' }

// =====================================================
// Bridge → Game actions
// =====================================================
export type GameAction =
  | { type: 'unlock_map' }
  | { type: 'complete_spot'; id: string }
  | { type: 'complete_all' }
  | { type: 'reset' }

// =====================================================
// Bridge: map events to actions
// =====================================================
export function onStoryEvent(event: StoryEvent): GameAction[] {
  switch (event.type) {
    case 'intro_finished': return [{ type: 'unlock_map' }]
    case 'scene_advanced': return []
    case 'story_closed':   return []
  }
}

export function onGameEvent(event: GameEvent): StoryAction[] {
  switch (event.type) {
    case 'spot_solved':     return [{ type: 'advance' }]
    case 'all_spots_complete': return [{ type: 'show_scene', id: 5 }]
    case 'puzzle4x4_done':  return []
    case 'gps_arrived':     return []
  }
}
