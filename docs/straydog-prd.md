# Stray Dog — Product Requirements Document

> **Project**: Mobile browser AR game — Jimbocho scavenger hunt to find a runaway dog
> **Status**: Draft v1
> **Date**: 2026-06-30
> **Related**: `逃げ出した犬を探すAR街歩き計画.md`

---

## 1. Executive Summary

Stray Dog is a location-based AR game that runs entirely in a mobile web browser (no app install). Players start at Café Sabouru in Jimbocho, where a golden retriever named Gold suddenly bolts out the door. Using only their phone camera, players follow AR paw prints, solve photographic puzzles across 7 stations, and ultimately find the dog. The experience takes 90–120 minutes and covers ~2.5 km through Jimbocho's bookshop streets, Kanda River, and YON gallery.

### Core Differentiators

- **Zero install** — pure web app, no App Store/Play Store
- **Camera-native AR** — no 8th Wall / WebXR SDK; uses `getUserMedia` + Canvas overlay
- **Photo-as-puzzle-mechanic** — each station requires taking a specific photograph to progress
- **Cross-browser** — works on both Chrome (Android) and Safari (iOS)

---

## 2. Problem / Opportunity

### Problem
- YON's 2nd anniversary event needs foot traffic to the gallery
- Most location games require app install (friction)
- Existing ARG (`arg_app.html`) is GPS-only; lacks camera/AR engagement

### Opportunity
- "Take a photo to solve" is intuitive, shareable, and Instagram-native
- Mobile browser AR is maturing (iOS 16+ Safari fully supports `getUserMedia`)
- Dog + mystery = viral potential on social media
- Can be launched alongside YON exhibition as a standalone activity

---

## 3. Target Users

| Persona | Description | Behavior |
|---------|-------------|----------|
| **Jimbocho Walker** | 20–40s, lives or works near Jimbocho | Goes to cafés, browses bookshops, shares on Instagram |
| **YON Visitor** | Art/design interested, attending YON exhibition | Already at the gallery, looking for extended experience |
| **Date / Hangout Pair** | Couple or friends, 2 people | Wants a light activity with a story; takes photos together |
| **Tourist** | Domestic tourist, curious about Jimbocho | Uses smartphone for navigation; enjoys photo-spot walks |

---

## 4. User Stories

### Onboarding
- As a player, I want to open the URL and start without signing up
- As a player, I want a clear "Start" button that takes me to the café

### Camera & AR
- As a player, I want to tap "Camera" to open the rear camera
- As a player, I want to see golden paw prints overlaid on the camera view
- As a player, I want to take a photo of a target and get immediate feedback
- As a player, I want to know if I took the right photo (green check) or wrong one (retry hint)

### Navigation
- As a player, I want a mini-map showing my location and nearby paw print clusters
- As a player, I want to see the next station's direction and distance

### Puzzle & Story
- As a player, I want each photo to reveal a story fragment (why Gold was here)
- As a player, I want a "collection" screen showing all photos I've taken
- As a player, I want the final reveal at YON gallery to feel rewarding

### Social
- As a player, I want to share my completed photo album on Instagram/X
- As a player, I want a share card with "I found Gold!" and my route

---

## 5. Functional Requirements

### F1 — Camera System
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| F1.1 | Open rear camera on tap | P0 | `facingMode: 'environment'` |
| F1.2 | Camera preview fills viewport | P0 | Safari <video> requires `playsinline` |
| F1.3 | Take photo with shutter button | P0 | Capture canvas frame from video |
| F1.4 | Toggle front/rear camera | P2 | |
| F1.5 | Flashlight toggle | P3 | |

### F2 — AR Overlay
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| F2.1 | Draw golden paw prints on Canvas over camera feed | P0 | Animated, following route direction |
| F2.2 | Display target silhouette guide | P0 | Semi-transparent outline of what to photograph |
| F2.3 | Show "discovery" animation when correct photo taken | P0 | Sparkle + text reveal |
| F2.4 | Display memory ghost (silhouette of past person) | P1 | |
| F2.5 | Render floating text bubbles (dog's thoughts) | P2 | |

### F3 — GPS & Location
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| F3.1 | Detect player location via GPS | P0 | `watchPosition`, high accuracy |
| F3.2 | Show player on mini-map | P0 | Leaflet map (reuse from `arg_app.html`) |
| F3.3 | Auto-trigger station mode when within 50m | P0 | |
| F3.4 | Fallback: manual station unlock if GPS denied | P1 | QR code or manual code entry |

### F4 — Puzzle Progression
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| F4.1 | Unlock stations in sequence (0→1→2→…→G) | P0 | |
| F4.2 | Each station requires a photo to proceed | P0 | |
| F4.3 | Validate photo: check GPS was at correct location | P0 | MVP: GPS only |
| F4.4 | Validate photo: check color/timestamp | P1 | |
| F4.5 | Validate photo: check QR code in frame | P1 | |
| F4.6 | Show hint text for failed photo attempt | P0 | |
| F4.7 | Save progress to localStorage on each station clear | P0 | |

### F5 — Story System
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| F5.1 | Show story text after each clear | P0 | Typing animation |
| F5.2 | Play dog bark / ambient sound | P1 | Web Audio API |
| F5.3 | Speech synthesis for dog's voice | P1 | `SpeechSynthesis`, Japanese |
| F5.4 | Display collected photos in album | P1 | Grid layout |
| F5.5 | Final completion screen with animated dog reveal | P0 | |

### F6 — Social Sharing
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| F6.1 | Generate share image (photo collage + "I found Gold!") | P1 | Canvas-based |
| F6.2 | Share via Web Share API | P1 | Falls back to copy link |
| F6.3 | Optional: hashtag #straydogyon | P2 | |

---

## 6. Non-Functional Requirements

| ID | Requirement | Target | Notes |
|----|------------|--------|-------|
| N1 | Page load time (initial) | < 3s on 4G | No framework; vanilla JS |
| N2 | Camera open latency | < 1.5s | |
| N3 | GPS update interval | Every 5s | Balance accuracy vs battery |
| N4 | Offline resilience | Core path works with cached assets | SW caches HTML + JS + CSS |
| N5 | Battery usage | < 15% per session | Camera off when not in use |
| N6 | Browser support | Chrome 90+ / Safari 15+ | |
| N7 | Accessibility | Minimum contrast 4.5:1 | Text overlay on camera can be hard to read |
| N8 | Error tolerance | Graceful degration if camera/GPS denied | Show text-only mode |

---

## 7. UI/UX Requirements

### 7.1 Screen Flow

```
Splash ──→ Home (Start / About) ──→ Camera (AR View)
                                        │
                                   ┌────┴────┐
                                   │         │
                            Station Clear   Hint/Retry
                                   │
                                   ▼
                            Story Fragment
                                   │
                          [Next Station] or [Album]
                                   │
                                   ▼
                         ... loop through 7 stations ...
                                   │
                                   ▼
                            Finale (YON Gallery)
                                   │
                                   ▼
                         Album + Share Screen
```

### 7.2 Key UI States per Station

1. **Approach** — Player is >50m away: mini-map + distance + direction arrow
2. **Arrive** — Player inside 50m zone: "カメラを起動" button pulses
3. **Camera** — Full-screen camera viewfinder with AR overlay
4. **Target Guide** — Silhouette of what to photograph appears on screen
5. **Capture** — Shutter animation, brief processing
6. **Result** — ✅ Success (story reveals) | ❌ Retry (hint shows)
7. **Album** — Thumbnail grid of all collected photos

### 7.3 Visual Style

- **Dark theme** — similar to `arg_app.html` (#0a0a0f background)
- **Gold accent** — #FFD700 for paw prints, highlights, progress indicators
- **Typography** — Hiragino Sans / Noto Sans JP
- **Animations** — Subtle particle effects on paw prints, gentle transitions
- **Dog emoji** — 🐕 used sparingly as icon

---

## 8. Technical Architecture

### 8.1 Stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla HTML5 + CSS3 |
| Camera | `navigator.mediaDevices.getUserMedia` |
| AR Overlay | Canvas 2D (video → canvas compositing) |
| Map | Leaflet.js (CDN) |
| QR | jsQR (CDN) |
| State | localStorage |
| Audio | Web Audio API + SpeechSynthesis |
| Build | None (static files) |
| Hosting | GitHub Pages / Netlify / Vercel (HTTPS required) |

### 8.2 File Structure

```
arg/dog-arg/
├── index.html          # Entry point, all screens
├── styles.css          # All styles
├── app.js              # Core state machine, routing
├── camera.js           # Camera init, capture, preview
├── ar-overlay.js       # Canvas AR drawing
├── puzzles.js          # 7 stations data, validation
├── story-data.js       # Story fragments, dog lines
├── map-view.js         # Leaflet mini-map
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
└── assets/
    ├── paw-print.svg
    ├── target-gold.svg
    ├── bark.mp3
    └── icon-192.png
```

### 8.3 Data Flow

```
[User Tap "Camera"]
    → requestCamera() → getUserMedia({video: facingMode: "environment"})
    → video.play() → Canvas AR loop starts (30fps)
    → drawPawPrints() + drawTargetGuide()

[User Tap Shutter]
    → captureFrame() → draw video frame to offscreen canvas
    → validatePhoto() → check GPS coords (MVP)
    → if valid: onStationClear() → revealStory() → advanceStation()
    → if invalid: showHint() → retry

[Progress Save]
    → saveToLocalStorage() { station: id, photos: [...], timestamp }
```

### 8.4 Safari Cross-Compatibility

See detailed table in `逃げ出した犬を探すAR街歩き計画.md#ブラウザ互換性対応表`.

Key rules:
- `playsinline` + `webkit-playsinline` on `<video>`
- Camera start must be inside a user gesture (click/tap)
- `AudioContext` must be resumed on tap
- HTTPS mandatory

---

## 9. Milestones & Timeline

| Phase | Deliverable | Duration | Output |
|-------|------------|----------|--------|
| **P0** | Route survey + story finalization | 1 week | Final 7 station locations, story script |
| **P1** | **MVP: GPS + Camera + Text puzzles** | 2 weeks | `index.html` with full 7-station loop, localStorage, map |
| **P2** | AR overlay (paw prints, animations) | 1 week | Canvas drawing layer, target guide, success effects |
| **P3** | QR trigger + color detection | 1 week | jsQR integration, optional ColorThief |
| **P4** | Audio, speech, polish | 1 week | Bark sounds, SpeechSynthesis, transition animations |
| **P5** | Social sharing + PWA | 1 week | Share image generation, manifest, SW |
| **QA** | Cross-browser testing + field test | 1 week | Real walk-through on iPhone + Android |
| **Launch** | Deploy + announce | — | |

**Total estimated time**: 8 weeks

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Completion rate | > 40% | Players who finish all 7 stations |
| Avg session duration | > 60 min | Analytics |
| Camera permission grant rate | > 70% | `getUserMedia` success rate |
| GPS permission grant rate | > 80% | Geolocation success rate |
| Share rate | > 15% | Web Share API calls |
| Error rate | < 5% | Failed photo validations per session |
| Cross-browser crashes | 0 | Manual QA reports |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Camera permission denied | High | Medium | Fallback: QR code mode |
| GPS denied | High | Medium | Manual station unlock via code or QR |
| iOS Safari video orientation bug | Medium | Medium | Test on real device early; CSS transform fix |
| Battery drain mid-walk | Medium | High | Camera only on when actively taking photo |
| Rain on event day | Low | High | Design UI for one-handed umbrella use |
| Shop cooperation withdrawn | Low | High | Make stations public-space-only (streets, parks) |
| SpeechSynthesis not working on iOS | Medium | Low | Always show text alongside audio |

---

## 12. Open Questions

- [ ] Should dog "Gold" connect to the Goldberg Variations existing lore? (current plan: optional)
- [ ] Fix 7 stations or allow free-roam order?
- [ ] Support English language? (PR target: Japanese-only for MVP)
- [ ] Backend needed for analytics? (MVP: no backend, use localStorage)
- [ ] Photo validation beyond GPS — what's the simplest v2 mechanism?
- [ ] Is YON on board with being the finale location?
- [ ] Café Sabouru cooperation — can we mention them in story?

---

## 13. Future Iterations

| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-language | English + Traditional Chinese | Medium |
| Leaderboard | Fastest completion times | Low |
| Seasonal routes | Cherry blossom, autumn leaves variants | Medium |
| Branching endings | Different dog locations based on photo choices | Low |
| Real-time multiplayer | Two players see same AR paw prints | Low |
| Cloud save | Progress persists across devices via QR code | Medium |

---

*End of PRD — Stray Dog / 逃げ出した犬を探すAR街歩き*
