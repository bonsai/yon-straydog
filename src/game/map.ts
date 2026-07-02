import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { SPOTS, type Spot } from './spots'

let map: L.Map | null = null
let userMarker: L.CircleMarker | null = null
let dogMarker: L.Marker | null = null
let spotMarkers: L.Marker[] = []
let watchId: number | null = null
let dogWanderId: number | null = null
let onArrive: ((spot: Spot) => void) | null = null
let arrivedSpots = new Set<string>()
let isMockMode = false

// Mock position (YON 2F area)
const MOCK_POS = { lat: 35.6950, lng: 139.7600 }

const DOG_ICON = L.divIcon({
  html: '<span style="font-size:2rem;filter:drop-shadow(0 2px 8px rgba(255,215,0,.5))">🐕</span>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

let forceMock = false

export function setForceMock(v: boolean): void {
  forceMock = v
}

export function setOnArrive(cb: (spot: Spot) => void): void {
  onArrive = cb
}

function isSpotUnlocked(id: string, completed: string[]): boolean {
  if (id === 's0' || id === 's1') return true
  if (id === 's2') return completed.includes('s0') && completed.includes('s1')
  if (id === 's3') return SPOTS.filter(s => s.id !== 's3').every(s => completed.includes(s.id))
  return false
}

export function startMap(arrivedIds: string[]): void {
  arrivedSpots = new Set(arrivedIds)
  const wrap = document.getElementById('map-wrap')
  if (wrap) wrap.style.display = 'flex'

  const mapEl = document.getElementById('map')
  if (!mapEl) return
  if (map) { map.invalidateSize(); return }

  map = L.map(mapEl, { zoomControl: false }).setView([MOCK_POS.lat, MOCK_POS.lng], 17)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(map)

  const accessible = SPOTS.filter(s => arrivedIds.includes(s.id) || isSpotUnlocked(s.id, arrivedIds))

  // Add unlocked spot markers
  spotMarkers = accessible.filter(s => !arrivedSpots.has(s.id)).map(s => {
    const marker = L.marker([s.lat, s.lng]).addTo(map!)
    marker.bindPopup(`<b>${s.icon} ${s.name}</b>`)
    return marker
  })

  // Add completed spot markers
  SPOTS.filter(s => arrivedSpots.has(s.id)).forEach(s => {
    L.circleMarker([s.lat, s.lng], {
      radius: 10, color: '#4caf50', fillColor: '#4caf50', fillOpacity: 0.5,
    }).addTo(map!).bindPopup(`✅ ${s.name}`)
  })

  // User marker
  userMarker = L.circleMarker([MOCK_POS.lat, MOCK_POS.lng], {
    radius: 8, color: '#ffd700', fillColor: '#ffd700', fillOpacity: 0.8,
  }).addTo(map)
  userMarker.bindPopup('📍 現在地')

  // Dog marker (wanders between unvisited, accessible spots)
  const unvisited = accessible.filter(s => !arrivedSpots.has(s.id))
  if (unvisited.length > 0) {
    const start = unvisited[Math.floor(Math.random() * unvisited.length)]
    dogMarker = L.marker([start.lat, start.lng], { icon: DOG_ICON, zIndexOffset: 1000 }).addTo(map)
    dogMarker.bindPopup('🐕 犬がここにいるかも…')
    startDogWander(unvisited)
  }

  // Show bottom sheet
  showBottomSheet('📡', '位置情報を取得中...', '', 'loading')

  // Start GPS
  startGPS()
}

function startDogWander(unvisited: Spot[]): void {
  let idx = 0
  dogWanderId = window.setInterval(() => {
    if (!dogMarker || unvisited.length === 0) return
    const spot = unvisited[idx % unvisited.length]
    dogMarker.setLatLng([spot.lat, spot.lng])
    idx++
  }, 4000)
}

export function stopMap(): void {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null }
  if (dogWanderId !== null) { clearInterval(dogWanderId); dogWanderId = null }
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
    if (dist < 50) checkArrival(spot)
  }
}

function updateUserPos(lat: number, lng: number): void {
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

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
