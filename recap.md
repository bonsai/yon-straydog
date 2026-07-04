# Stray Dog Recap — 2026-07-04 Session

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

## Build & Deploy

| step | result |
|------|--------|
| Build (Vite) | 232 kB JS ✅ |
| GitHub push | `6dc20d7` ✅ |
| Surge | `straydog.surge.sh` ✅ |

## URLs

```
Prod:  https://straydog.surge.sh
Debug: https://straydog.surge.sh#debug
```
