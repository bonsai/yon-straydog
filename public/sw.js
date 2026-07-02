const CACHE = 'straydog-v1'
const PRECACHE = [
  '.',
  'index.html',
  'src/style.css',
  'src/main.ts',
  'src/store.ts',
  'src/hub.ts',
  'src/map.ts',
  'src/sound.ts',
  'src/story/spots.ts',
  'src/story/data.ts',
  'src/story/adventure.ts',
  'src/story/story-mode.ts',
  'src/game/game-state.ts',
  'src/game/registry.ts',
  'src/game/puzzle/puzzle.ts',
  'src/game/puyo/puyo-game.ts',
  'src/game/puyo/logic.ts',
  'src/game/puyo/view.ts',
  'src/game/puyo/types.ts',
  'src/game/simon/simon-game.ts',
  'src/game/simon/logic.ts',
  'src/game/simon/view.ts',
  'src/game/simon/types.ts',
  'src/game/quiz/quiz4-game.ts',
  'gdog.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((r) => r || fetch(event.request).catch(() => new Response('Offline', { status: 503 })))
  )
})
