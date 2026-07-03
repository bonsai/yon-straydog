import { describe, it, expect } from 'vitest'
import { getDistance } from '../map'
import { SPOTS } from '../../story/spots'

describe('getDistance', () => {
  it('returns 0 for same point', () => {
    expect(getDistance(35.695, 139.758, 35.695, 139.758)).toBe(0)
  })

  it('returns positive distance for different points', () => {
    const dist = getDistance(35.695, 139.758, 35.696, 139.759)
    expect(dist).toBeGreaterThan(0)
  })

  it('distance is symmetric', () => {
    const d1 = getDistance(35.695, 139.758, 35.696, 139.759)
    const d2 = getDistance(35.696, 139.759, 35.695, 139.758)
    expect(Math.abs(d1 - d2)).toBeLessThan(0.01)
  })

  it('distance between known spot coordinates is reasonable', () => {
    const s0 = SPOTS[0]
    const s1 = SPOTS[1]
    const dist = getDistance(s0.lat, s0.lng, s1.lat, s1.lng)
    expect(dist).toBeGreaterThan(50)
    expect(dist).toBeLessThan(500)
  })

  it('arrival detection works within 10m threshold', () => {
    const spot = SPOTS[0]
    // ~5.5m offset (0.00005 deg lat ≈ 5.5m)
    const near = getDistance(spot.lat + 0.00005, spot.lng, spot.lat, spot.lng)
    expect(near).toBeLessThan(10)
    // ~22m offset (0.0002 deg lat ≈ 22m)
    const far = getDistance(spot.lat + 0.0002, spot.lng, spot.lat, spot.lng)
    expect(far).toBeGreaterThan(10)
  })
})
