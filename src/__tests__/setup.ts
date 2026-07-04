import { vi } from 'vitest'

const store = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn((k: string) => store.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => store.set(k, v)),
    removeItem: vi.fn((k: string) => store.delete(k)),
    clear: vi.fn(() => store.clear()),
    get length() { return store.size },
    key: vi.fn((i: number) => [...store.keys()][i] ?? null),
  },
  configurable: true,
})

class MockAudioContext {
  state = 'running'
  sampleRate = 44100
  currentTime = 0
  createBuffer() { return { getChannelData: () => new Float32Array(100) } }
  createBufferSource() { return { connect: () => this, start: () => {}, stop: () => {}, buffer: null } }
  createGain() { return { connect: () => this, gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } } }
  createOscillator() { return { connect: () => this, start: () => {}, stop: () => {}, type: '', frequency: { value: 0 } } }
  createBiquadFilter() { return { connect: () => this, type: '', frequency: { value: 0 }, Q: { value: 0 } } }
  resume() { return Promise.resolve() }
  connect() { return this }
  destination = this
}

Object.defineProperty(globalThis, 'AudioContext', { value: MockAudioContext, configurable: true })

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.reject(new Error('mock: permission denied'))),
  },
  configurable: true,
})
