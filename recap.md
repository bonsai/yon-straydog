# Stray Dog Recap — 2026-07-05 Session

## GPS / Spots

| spot | name | lat | lng | source |
|------|------|-----|-----|--------|
| s0 | YON 2F | 35.69597 | 139.75839 | OSM 神保町駅 |
| s1 | さぼうる | 35.69557 | 139.75868 | OSM café node |
| s2 | 響（野外彫刻） | 35.69450 | 139.76150 | alley estimate (no OSM node) |
| s3 | 神田橋公園 | 35.68967 | 139.76409 | OSM park node |
| s4 | YON 3F リビングミュージック | 35.69597 | 139.75839 | same building as s0 |

- s0↔s1 = 52m (0.6min), s1↔s2 = 330m (4.1min), s2↔s3 = 620m (7.8min)
- `map.ts`: duplicate offset 0.0002 → 0.0005 (s0/s4 same coords → 55m apart on map)
- `spots.db` SQLite reference created (haversine + walk_min precomputed)

## Map UI

- Removed: user 👤 icon (`map.ts` L111-114 deleted)
- Dog 🐕: moves every 0.5-2s (was 1-8s with 30% stay chance) — always wandering
- Completed spots: green circle → faded spot icon (opacity .6 + grayscale .5) + ✅ badge

## Story

- Removed from `spots.ts` s3: 「私たち、親になるんだね」
- New text: `金の像の前で立ち止まる。犬は──家に帰っている。`

## s4 Game (Final Puzzle)

**Bug**: 「4つ目の謎に行ったが何も起こらない」
- **Root cause**: `s4-game.ts` used HTML5 Drag & Drop API (`draggable` attribute) — does NOT work on mobile/touch devices
- **Fix**: Rewrote to tap-to-select + tap-to-match
  1. Tap right block → selected (yellow border + glow)
  2. Tap left slot → match check
  3. Success: both turn green, `matchedCount++`
  4. Wrong: left slot blinks red (`shake` animation)
  5. 3/3 matches → `completeCurrentSpot()` → ending

**Files changed**:
- `src/game/s4-game.ts` — full rewrite (66 lines, tap logic)
- `src/style.css` — `.selected` + `.wrong` styles added

## Build & Deploy

| step | result |
|------|--------|
| Build (Vite) | 232 kB JS ✅ |
| GitHub push | `f4e19e9` ✅ |
| Surge | `straydog.surge.sh` ✅ |

## URLs

```
Prod:  https://straydog.surge.sh
Debug: https://straydog.surge.sh#debug
```
