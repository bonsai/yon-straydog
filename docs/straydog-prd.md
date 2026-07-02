# Stray Dog — Product Requirements Document

> **Project**: Mobile browser GPS game — Jimbocho scavenger hunt to find a runaway dog
> **Status**: v2 (implemented)
> **Date**: 2026-07-03

---

## 1. Executive Summary

Stray Dog is a location-based adventure game that runs entirely in a mobile web browser (no app install). Players start at YON 2F, meet a couple whose dog has run away, solve a 4x4 photo puzzle to get the first clue, then walk through Jimbocho visiting 3 spots (Café Sabouru, Hibiki sculpture, Kanda Bridge Park). At each spot, a mini-game must be cleared to earn a badge. Collecting all 3 badges reveals the dog's location at YON 3F Living Music. The experience takes ~60 minutes and covers ~1.5 km.

### Core Differentiators

- **Zero install** — pure web app, no App Store/Play Store
- **GPS-driven** — real-world location triggers mini-game unlocks
- **Mini-game variety** — puyo, Simon, kanji quiz at each spot
- **PWA** — installable on home screen, works offline
- **Narrative** — dog's memory fragments reveal a couple's story

---

## 2. Problem / Opportunity

### Problem
- YON's 2nd anniversary event needs foot traffic to the gallery
- Most location games require app install (friction)
- Existing walk events lack gamification

### Opportunity
- "Walk + solve puzzles" is intuitive and social
- Pure web app removes install barrier
- Dog + mystery story creates emotional engagement
- Can be launched alongside YON exhibition

---

## 3. Target Users

| Persona | Description | Behavior |
|---------|-------------|----------|
| **Jimbocho Walker** | 20–40s, lives/near Jimbocho | Cafés, bookshops, Instagram |
| **YON Visitor** | Art/design interested | Already at gallery, extended experience |
| **Date / Hangout** | Couple or friends | Light activity with a story |
| **Tourist** | Domestic tourist | Smartphone navigation, photo spots |

---

## 4. User Flow

```
START → INTRO (typing animation, gdog.png fade-in)
         → 4×4 SLIDE PUZZLE (reconstruct torn photo)
           → HUB (4 spot cards, 3 badge indicators)
             → SELECT SPOT (unlocked: s0/s1 → s2 → s3)
               → STORY TEXT (adventure overlay)
                 → MAP (Leaflet + GPS)
                   → ARRIVE at spot (50m radius)
                     → MINI-GAME (puyo / simon / quiz)
                       → BADGE RESULT (story fragment)
                         → HUB (loop)
                           → 3 BADGES → s3 unlocks
                             → FINAL STORY (YON 3F)
                               → COMPLETE (confetti, share)
```

---

## 5. Spot Design

| ID | Spot | Game | Badge | Unlock |
|----|------|------|-------|--------|
| s0 | さぼうる (Café Sabouru) | 🧩 Puyo | 🍨 クリームソーダ | Initial |
| s1 | 響 (Hibiki sculpture) | 🎵 Simon | 🔔 彫刻 | Initial |
| s2 | 神田橋公園 (Kanda Bridge Park) | ✍️ Kanji quiz | 🗽 金ピカ | s0 + s1 |
| s3 | YON 3F リビングミュージック | — (final) | 🎵 音 | 3 badges |

### Coordinates

| Spot | Lat | Lng |
|------|-----|-----|
| s0 さぼうる | 35.69580 | 139.75800 |
| s1 響 | 35.69412 | 139.75954 |
| s2 神田橋公園 | 35.69480 | 139.76500 |
| s3 YON 3F | 35.69598 | 139.75765 |

---

## 6. Functional Requirements

### F1 — Intro & Onboarding
| ID | Requirement | Status |
|----|------------|--------|
| F1.1 | Typing animation using INTRO_LINES (per-line speed/color) | ✅ |
| F1.2 | Skip button to bypass intro | ✅ |
| F1.3 | gdog.png background fade-in (4s) | ✅ |
| F1.4 | localStorage sd_intro_done skips on revisit | ✅ |

### F2 — 4×4 Photo Puzzle
| ID | Requirement | Status |
|----|------------|--------|
| F2.1 | 16 tiles shuffled from gdog.png | ✅ |
| F2.2 | Tap to select, tap again to swap | ✅ |
| F2.3 | Move counter | ✅ |
| F2.4 | Solved animation + hint "さぼうるのレインボウをさがせ" | ✅ |
| F2.5 | Persist sd_4x4_done in localStorage | ✅ |

### F3 — Spot Hub
| ID | Requirement | Status |
|----|------------|--------|
| F3.1 | 2×2 grid of spot cards | ✅ |
| F3.2 | Lock/unlock/done states per card | ✅ |
| F3.3 | Badge progress bar (⚪/🟡) | ✅ |
| F3.4 | Story mode (past log) button | ✅ |
| F3.5 | Debug panel (visible with #debug hash) | ✅ |

### F4 — Story System
| ID | Requirement | Status |
|----|------------|--------|
| F4.1 | Adventure overlay with step queue | ✅ |
| F4.2 | Text/choice/action step types | ✅ |
| F4.3 | 7 story scenes (intro, 4 spots, finale, epilogue) | ✅ |
| F4.4 | Story mode for reviewing past scenes | ✅ |

### F5 — Map & GPS
| ID | Requirement | Status |
|----|------------|--------|
| F5.1 | Leaflet map with OpenStreetMap tiles | ✅ |
| F5.2 | Player location marker (golden circle) | ✅ |
| F5.3 | Dog marker wanders between unvisited spots | ✅ |
| F5.4 | Spot markers with popups | ✅ |
| F5.5 | GPS watchPosition with 50m arrival detection | ✅ |
| F5.6 | Haversine distance calculation | ✅ |
| F5.7 | Fallback: mock GPS after 8s timeout | ✅ |
| F5.8 | Bottom sheet: loading → arrived → "謎を解く" | ✅ |

### F6 — Mini-games
| ID | Requirement | Status |
|----|------------|--------|
| F6.1 | Puyo: 6×12 grid, 4-match clear, 3 clears to win | ✅ |
| F6.2 | Simon: 4-panel (do-re-mi-so), 4 rounds | ✅ |
| F6.3 | Kanji quiz: 47 questions, □ fill-in, reading hint | ✅ |
| F6.4 | All games call completeCurrentSpot() on clear | ✅ |
| F6.5 | Sound effects via Web Audio API | ✅ |

### F7 — Badge & Progress
| ID | Requirement | Status |
|----|------------|--------|
| F7.1 | Badge per spot (emoji + name) | ✅ |
| F7.2 | Result screen: icon + badge + progress | ✅ |
| F7.3 | localStorage persistence (sd_completed) | ✅ |
| F7.4 | 3 badges unlock s3 (final spot) | ✅ |

### F8 — Sound
| ID | Requirement | Status |
|----|------------|--------|
| F8.1 | Bark sound (noise + bandpass filter) | ✅ |
| F8.2 | Correct chime (ascending C-E-G) | ✅ |
| F8.3 | Wrong buzz (150Hz sawtooth) | ✅ |
| F8.4 | Typing click (2ms noise burst) | ✅ |
| F8.5 | Complete fanfare (C-E-G-C arpeggio) | ✅ |

### F9 — PWA & Sharing
| ID | Requirement | Status |
|----|------------|--------|
| F9.1 | manifest.json (standalone, #0a0a0f) | ✅ |
| F9.2 | Service Worker (pre-cache all source files) | ✅ |
| F9.3 | iOS meta tags (apple-mobile-web-app-capable) | ✅ |
| F9.4 | apple-touch-icon (gdog.png) | ✅ |
| F9.5 | Share button on complete screen | ✅ |
| F9.6 | Web Share API + clipboard fallback | ✅ |
| F9.7 | Hashtags: #StrayDogYON #神保町 | ✅ |

### F10 — CI/CD
| ID | Requirement | Status |
|----|------------|--------|
| F10.1 | GitHub Actions: test + build on push/PR | ✅ |
| F10.2 | 73 unit tests across 9 test files | ✅ |
| F10.3 | Vite production build | ✅ |
| F10.4 | Surge deploy (straydog.surge.sh) | ⏳ token |

---

## 7. Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 6 |
| Build | Vite 6 |
| Map | Leaflet 1.9 |
| Sound | Web Audio API |
| State | localStorage |
| Test | Vitest 4 + jsdom |
| CI | GitHub Actions |
| Hosting | Surge / GitHub Pages |

### File Structure

```
yon-straydog/
├── index.html                 # Vite entry (copied from public/)
├── vite.config.js
├── tsconfig.json
├── vitest.config.ts
├── package.json
├── .github/workflows/
│   └── ci.yml                # test + build on push
├── public/
│   ├── index.html             # Static fallback
│   ├── manifest.json          # PWA
│   ├── sw.js                  # Service Worker
│   ├── gdog.png               # Dog photo (puzzle image)
│   ├── CNAME                  # Surge domain
│   └── time-slip.html         # (unused)
├── src/
│   ├── main.ts                # Entry point, screen transitions, flow
│   ├── store.ts                # State management (localStorage)
│   ├── hub.ts                 # Spot hub, toolbar, badge mgmt
│   ├── map.ts                 # Leaflet map, GPS, arrival detection
│   ├── sound.ts               # Web Audio API sound effects
│   ├── style.css              # All styles (212 lines)
│   ├── story/
│   │   ├── spots.ts           # 4 spot definitions
│   │   ├── data.ts            # INTRO_LINES + STORY_SCENES
│   │   ├── adventure.ts       # Step executor (text/choice/action)
│   │   └── story-mode.ts      # Story log viewer
│   ├── game/
│   │   ├── game-state.ts      # Phase machine + step builders
│   │   ├── registry.ts        # Mini-game starter registration
│   │   ├── puzzle/            # 4×4 slide puzzle (logic)
│   │   ├── puyo/              # Puyo (logic + view + types)
│   │   ├── simon/             # Simon (logic + view + types)
│   │   └── quiz/              # Kanji quiz
│   ├── __tests__/             # store.test, sound.test, setup
│   └── _legacy/               # Old code (not in active use)
├── test/                      # Standalone HTML test files
├── issues/                    # 11 issues (7 done, 4 planned)
├── docs/                      # PRD, script, UX spec, ADRs
└── HANDBACK.md                # Next-session handover
```

---

## 8. Narrative

### Characters
- **夫 (Husband)** — quiet, worried, his dog ran away
- **妻 (Wife)** — pregnant, can't walk, asks player for help
- **犬 / Gold (Dog)** — golden retriever, loves music and cream soda

### Story Beats
1. **YON 2F**: Couple appears via QR, explains the situation
2. **さぼうる**: Dog used to stare at the rainbow cream soda
3. **響**: Dog listened to the silent resonance of the sculpture
4. **神田橋公園**: The couple realized they'd become parents here
5. **YON 3F**: Dog found listening to vacuum tube amp (Goldberg Variations)
6. **Epilogue**: Goldberg layer — the city's sounds become Bach's variations

---

## 9. Non-Functional Requirements

| ID | Requirement | Target |
|----|------------|--------|
| N1 | Page load | < 3s on 4G |
| N2 | GPS update | Every 5s |
| N3 | Offline | Core path with SW cache |
| N4 | Browser | Chrome 90+ / Safari 15+ |
| N5 | Theme | Dark fixed (#0a0a0f) |
| N6 | Touch target | ≥ 44×44px |

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Completion rate | > 40% | Players who finish all 4 spots |
| Avg session duration | > 45 min | localStorage timestamps |
| GPS permission rate | > 80% | watchPosition success |
| Share rate | > 15% | Web Share API calls |
| PWA installs | > 50 | manifest.json hits |

---

## 11. Open Issues

| # | Title | Status |
|---|-------|--------|
| 08 | Sound effects | ✅ Done |
| 09 | Intro typing animation | ✅ Done |
| 10 | PWA & sharing | ✅ Done |
| 11 | Real-device testing | ⏳ Checklist |

---

## 12. Future Iterations

| Feature | Priority |
|---------|----------|
| Real GPS field testing & calibration | High |
| iOS Safari compatibility audit | High |
| BGM (Goldberg Variations loop) | Medium |
| Accessibility (ARIA, reduced motion) | Medium |
| English / Traditional Chinese | Low |
| Analytics (no backend, localStorage) | Low |
| Branching endings | Low |

---

*End of PRD v2 — Stray Dog / 迷い犬を探すGPS街歩きゲーム*
