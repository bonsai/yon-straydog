import { useDogStore } from '../store'
import { STORY_SCENES } from '../story/spots'
import { buildStorySteps, setPhase, setSteps } from '../game-state'
import { startAdventure } from './adventure'
import { setCurrentGameSpot, showTools } from '../hub'
import { startMap, stopMap, setOnArrive } from '../map'
import { SPOTS } from './spots'

const SPOT_TO_SCENE: Record<string, number> = { s0: 1, s1: 2, s2: 3, s3: 4 }

export function startSpotFlow(spotId: string): void {
  const spot = SPOTS.find(s => s.id === spotId)
  if (!spot) return

  setPhase('hub')
  showTools(true)
  const spotHub = document.getElementById('spot-hub')
  if (spotHub) spotHub.classList.remove('open')

  const runGame = () => {
    setCurrentGameSpot(spotId)
    showTools(false)
    const starter = (window as any).__gameStarters?.[spotId]
    if (starter) starter()
  }

  setOnArrive((arrivedSpot) => {
    if (arrivedSpot.id !== spotId) return
    stopMap()
    const sceneIdx = SPOT_TO_SCENE[spotId]
    if (sceneIdx !== undefined) {
      const scene = STORY_SCENES[sceneIdx]
      const steps = buildStorySteps(scene.icon, scene.title, scene.paragraphs, runGame, 'play', '謎を解くか？')
      setSteps(steps)
      startAdventure()
    } else {
      runGame()
    }
  })

  startMap(useDogStore.getState().completed)
}
