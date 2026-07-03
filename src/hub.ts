export {
  setupTools, startSpotHub, registerGameStarters, showTools,
  setCurrentGameSpot, setOnSpotCleared, completeCurrentSpot,
  currentGameSpot, onSpotCleared, getBadgeCount,
} from './map/hub'

if (import.meta.env.DEV) {
  const _log = console.log.bind(console, '[hub:debug]')
  Object.defineProperty(globalThis, '__debugHub', {
    value: {
      log: _log,
      toggleMapMock(): void {
        _log('map mock toggled')
      },
    },
  })
  _log('debug hub ready — re-exports from ./map/hub')
  document.addEventListener('DOMContentLoaded', () => {
    _log('DOM ready; hub functions available on window.__debugHub')
  })
}
