import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { SPOTS, type Spot } from '../story/spots'
import { isTestMode } from '../test-mode'

let map: L.Map | null = null
let userMarker: L.Marker | null = null
let dogMarker: L.Marker | null = null
let spotMarkers: L.Marker[] = []
let watchId: number | null = null
let dogWanderId: number | null = null
let dogSpot: Spot | null = null
let onSpotClick: ((spot: Spot) => void) | null = null

export function setOnSpotClick(cb: ((spot: Spot) => void) | null): void {
  onSpotClick = cb
}
let arrivedSpots = new Set<string>()
let isMockMode = false
let lastUserPos: { lat: number; lng: number } | null = null

// Mock position (YON 2F area)
const MOCK_POS = { lat: 35.6950, lng: 139.7600 }

const DOG_ICON = L.divIcon({
  html: '<span style="font-size:2rem;filter:drop-shadow(0 2px 8px rgba(255,215,0,.5))">🐕</span>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const USER_ICON = L.divIcon({
  html: '<span style="font-size:1.5rem">👤</span>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

let forceMock = false

export function setForceMock(v: boolean): void {
  forceMock = v
}

export function setOnArrive(cb: (spot: Spot) => void): void {
  onArrive = cb
}

function isSpotUnlocked(id: string, completed: string[]): boolean {
  if (isTestMode()) return true
  if (id === 's0') return true
  if (id === 's1') return completed.includes('s0') || localStorage.getItem('sd_intro_done') === 'true'
  if (id === 's2') return completed.includes('s1')
  if (id === 's3') return completed.includes('s2')
  if (id === 's4') return SPOTS.filter(s => s.game !== 'final').every(s => completed.includes(s.id))
  return false
}

export function startMap(arrivedIds: string[], visibleIds?: string[]): void {
  arrivedSpots = new Set(arrivedIds)
  const wrap = document.getElementById('map-wrap')
  if (wrap) wrap.style.display = 'flex'

  const mapEl = document.getElementById('map')
  if (!mapEl) return
  if (map) { map.invalidateSize(); return }

  const accessible = visibleIds
    ? SPOTS.filter(s => visibleIds.includes(s.id))
    : SPOTS.filter(s => arrivedIds.includes(s.id) || isSpotUnlocked(s.id, arrivedIds))
  const firstSpot = accessible.find(s => !arrivedSpots.has(s.id)) || SPOTS[0]

  map = L.map(mapEl, { zoomControl: false }).setView([firstSpot.lat, firstSpot.lng], 17)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map)

  // Add unlocked spot markers (first unvisited spot pulses)
  const usedCoords = new Set<string>()
  spotMarkers = accessible.filter(s => !arrivedSpots.has(s.id)).map((s, i) => {
    const html = i === 0
      ? `<div class="spot-pulse"><span>${s.icon}</span></div>`
      : `<span style="font-size:1.5rem">${s.icon}</span>`
    let { lat, lng } = s
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`
    if (usedCoords.has(key)) { lat += 0.0005 * usedCoords.size; lng += 0.0005 * usedCoords.size }
    usedCoords.add(key)
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({ html, className: '', iconSize: [32, 32], iconAnchor: [16, 16] }),
      zIndexOffset: 2000,
    }).addTo(map!)
    marker.bindPopup(() => {
      const pos = lastUserPos ?? MOCK_POS
      const dist = getDistance(pos.lat, pos.lng, s.lat, s.lng)
      if (dist <= 10) {
        return `<b>${s.icon} ${s.name}</b><br><span style="color:#4caf50;font-size:.7rem">📍 ${Math.round(dist)}m</span><br><a href="javascript:void(0)" onclick="window.__spotClick?.('${s.id}')" style="color:#ffd700;text-decoration:underline;font-size:.8rem">▶ 謎を解く</a>`
      }
      return `<b>${s.icon} ${s.name}</b><br><span style="color:#888;font-size:.7rem">📡 ${Math.round(dist)}m 先</span><br><a href="javascript:void(0)" onclick="window.__moveTo?.('${s.id}')" style="color:#4fc3f7;text-decoration:underline;font-size:.8rem">📍 ここへ移動</a>`
    })
    return marker
  })

  // Add completed spot markers - スポットのアイコン+チェックマーク
  SPOTS.filter(s => arrivedSpots.has(s.id)).forEach(s => {
    const icon = L.divIcon({
      html: `<div style="position:relative;display:inline-block;opacity:.6;filter:grayscale(.5)"><span style="font-size:1.3rem">${s.icon}</span><span style="position:absolute;bottom:-4px;right:-6px;font-size:.9rem">✅</span></div>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 16]
    })
    L.marker([s.lat, s.lng], { icon, zIndexOffset: 500 }).addTo(map!).bindPopup(`✅ ${s.name}`)
  })

  // User icon removed - 現在地不要
  lastUserPos = { lat: firstSpot.lat, lng: firstSpot.lng }

  // Dog marker (wanders between unvisited, accessible spots continuously)
  const unvisited = accessible.filter(s => !arrivedSpots.has(s.id))
  if (unvisited.length > 0) {
    const start = unvisited[Math.floor(Math.random() * unvisited.length)]
    dogMarker = L.marker([start.lat, start.lng], { icon: DOG_ICON, zIndexOffset: 100 }).addTo(map)
    dogMarker.bindPopup('🐕 犬がここにいるかも…')
    startDogWander(unvisited)
  }

  // Show bottom sheet
  showBottomSheet('📡', '位置情報を取得中...', '', 'loading')

  // Start GPS
  startGPS()
}

function startDogWander(unvisited: Spot[]): void {
  let currentSpot: Spot | null = null
  const scheduleNext = () => {
    if (!dogMarker || unvisited.length === 0) return
    const spot = unvisited[Math.floor(Math.random() * unvisited.length)]
    currentSpot = spot
    dogMarker.setLatLng([spot.lat, spot.lng])
    dogMarker.setPopupContent(`🐕 ${spot.icon} ${spot.name}？`)
    dogSpot = spot
    // 常に動き続ける - 0.5〜2秒で次へ
    dogWanderId = window.setTimeout(scheduleNext, 500 + Math.random() * 1500)
  }
  scheduleNext()
}

export function stopMap(): void {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null }
  if (dogWanderId !== null) { clearTimeout(dogWanderId); dogWanderId = null }
  if (map) { map.remove(); map = null }
  spotMarkers = []
  userMarker = null
  dogMarker = null
  const wrap = document.getElementById('map-wrap')
  if (wrap) wrap.style.display = 'none'
}

function startGPS(): void {
  if (forceMock) { startMockGPS(); return }
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
      onPosition,
      () => { startMockGPS() },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    setTimeout(() => { if (!isMockMode && watchId !== null) startMockGPS() }, 8000)
  } else {
    startMockGPS()
  }
}

function startMockGPS(): void {
  if (isMockMode) return
  isMockMode = true
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null }
  showBottomSheet('🧪', 'モック位置情報', 'タップしてスポットへ移動', 'ready')
  document.getElementById('bs-btn')!.textContent = '📍 次のスポットへ'
  document.getElementById('bs-btn')!.onclick = () => mockStep()
}

let mockStepIdx = 0

function mockStep(): void {
  const available = SPOTS.filter(s => !arrivedSpots.has(s.id) && isSpotUnlocked(s.id, [...arrivedSpots]))
  if (mockStepIdx >= available.length) mockStepIdx = 0
  const spot = available[mockStepIdx]
  if (!spot) return
  mockStepIdx++
  updateUserPos(spot.lat, spot.lng)
  checkArrival(spot)
}

function onPosition(pos: GeolocationPosition): void {
  const { latitude, longitude } = pos.coords
  updateUserPos(latitude, longitude)

  // Check if near any spot
  for (const spot of SPOTS) {
    if (arrivedSpots.has(spot.id)) continue
    const dist = getDistance(latitude, longitude, spot.lat, spot.lng)
    if (dist < 10) checkArrival(spot)
  }
}

function updateUserPos(lat: number, lng: number): void {
  lastUserPos = { lat, lng }
  if (userMarker) {
    userMarker.setLatLng([lat, lng])
    map?.panTo([lat, lng])
  }
}

function checkArrival(spot: Spot): void {
  if (arrivedSpots.has(spot.id)) return
  arrivedSpots.add(spot.id)

  showBottomSheet(spot.icon, spot.name, spot.hint, 'ready')

  const btn = document.getElementById('bs-btn') as HTMLButtonElement
  btn.textContent = '謎を解く'
  btn.className = 'ready'
  btn.onclick = () => {
    stopMap()
    onArrive?.(spot)
  }
}

function showBottomSheet(icon: string, title: string, desc: string, state: 'loading' | 'ready'): void {
  const titleEl = document.getElementById('bs-title')
  const subEl = document.getElementById('bs-sub')
  const descEl = document.getElementById('bs-desc')
  const loadingEl = document.getElementById('bs-loading')
  const btn = document.getElementById('bs-btn')

  if (titleEl) titleEl.textContent = `${icon} ${title}`
  if (subEl) subEl.textContent = state === 'loading' ? '📍 GPS信号を待っています...' : '📍 到着しました！'
  if (descEl) descEl.textContent = desc
  if (loadingEl) loadingEl.style.display = state === 'loading' ? 'flex' : 'none'
  if (btn) {
    (btn as HTMLButtonElement).className = 'locked'
    btn.textContent = state === 'loading' ? '...' : '謎を解く'
  }
}

export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getCurrentPosition(): { lat: number; lng: number } | null {
  return lastUserPos
}

export function mockMoveTo(spotId: string): void {
  const spot = SPOTS.find(s => s.id === spotId)
  if (!spot) return
  updateUserPos(spot.lat, spot.lng)
  checkArrival(spot)
}
