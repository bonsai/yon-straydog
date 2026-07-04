# Stray Dog — Agent Guide

## Project
GPS街歩きミニゲーム「Stray Dog」— 神保町で迷い犬を探す

## Tech Stack
- TypeScript 6 + Vite 6
- Leaflet 1.9 (地図)
- Web Audio API (効果音)
- Vitest 4 + jsdom (テスト)
- GitHub Actions (CI)
- Surge (デプロイ: straydog.surge.sh)

## Commands
```bash
npm run dev      # dev server (localhost:5000)
npm test         # vitest (73 tests)
npm run build    # production build → dist/
npm run deploy   # surge deploy
```

## Architecture
```
src/main.ts       — entry, screen transitions, all flow control
src/store.ts      — state (localStorage)
src/hub.ts        — spot hub, toolbar
src/map.ts        — Leaflet + GPS + arrival detection
src/sound.ts      — Web Audio API effects
src/story/        — spots, data, adventure, story-mode
src/game/         — game-state, puzzle, puyo, simon, quiz
```

## Flow
```
Intro(typing) → 4x4 puzzle → Hub → spot → Map+GPS → arrive → mini-game → badge → Hub
→ 3 badges → s3 unlock → ending(confetti+share)
```

## Naming Conventions
- Files: kebab-case (`game-state.ts`, `story-mode.ts`)
- Functions: camelCase (`startSpotMap`, `goToHub`)
- Types: PascalCase (`SpotId`, `GamePhase`)
- Spots: s0/s1/s2/s3 (`src/story/spots.ts`)
- localStorage keys: `sd_*` prefix

## Key Files
| File | Purpose |
|------|---------|
| `src/story/spots.ts` | 4 spot definitions (coords, badge, game type) |
| `src/story/data.ts` | INTRO_LINES + STORY_SCENES |
| `src/game/game-state.ts` | Phase machine + step builders |
| `src/game/registry.ts` | Mini-game starter registration |
| `src/map.ts` | Leaflet map, GPS watchPosition, arrival |
| `public/index.html` | HTML (root + public/ are identical) |
| `vite.config.js` | Vite config (port 5000) |

## Debug Mode
Append `#debug` to URL to show debug panel.

## Tests
```bash
npm test                    # all tests
npx vitest run --reporter=verbose  # detailed output
```
Test files: `src/**/__tests__/*.test.ts`

## Issues
See `issues/` directory (11 issues, #01-10 done, #11 planned).

## Handover
See `HANDBACK.md` for next-session context.
