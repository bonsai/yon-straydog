import { useDogStore } from '../store'
import { STORY_SCENES } from '../story/spots'
import { SPOTS } from './spots'
import { buildStorySteps } from '../game-state'
import { startAdventure } from './adventure'
import { setCurrentGameSpot, showTools } from '../hub'
import { startMap, stopMap, setOnArrive, setForceMock } from '../map'
import { startStoryScene } from './story-mode'

const SPOT_TO_SCENE: Record<string, number> = { s0: 1, s1: 2, s2: 3, s3: 4 }

export function startSpotFlow(spotId: string): void {
  const spot = SPOTS.find(s => s.id === spotId)
  if (!spot) return

  const sceneIdx = SPOT_TO_SCENE[spotId]
  const runGame = () => {
    setCurrentGameSpot(spotId)
    showTools(false)
    const starter = (window as any).__gameStarters?.[spotId]
    if (starter) starter()
  }

  setOnArrive((arrivedSpot) => {
    if (arrivedSpot.id !== spotId) return
    stopMap()
    if (sceneIdx !== undefined) {
      const scene = STORY_SCENES[sceneIdx]
      const steps = buildStorySteps(scene.icon, scene.title, scene.paragraphs, runGame, 'play', '謎を解くか？')
      setCurrentGameSpot(spotId)
      showTools(false)
      startAdventure(steps)
    } else {
      runGame()
    }
  })

  startMap(useDogStore.getState().completed)
}

export function openStoryModal(idx: number, onClose?: () => void): void {
  showTools(false)
  startStoryScene(idx, () => {
    showTools(true)
    onClose?.()
  })
}

export function enableDebugMode(): void {
  setForceMock(true)
  const debugStyle = document.createElement('style')
  debugStyle.textContent = '.debug-only{display:inline-block!important}'
  document.head.appendChild(debugStyle)
}
