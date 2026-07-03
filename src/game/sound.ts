let ctx: AudioContext | null = null
let resumed = false

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (!resumed && ctx.state === 'suspended') {
    ctx.resume().then(() => { resumed = true })
  }
  return ctx
}

export function ensureResumed(): void {
  getCtx()
}

function noise(buf: AudioBuffer, len: number): void {
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
}

export function playBark(): void {
  const c = getCtx()
  const sr = c.sampleRate
  const len = Math.floor(sr * 0.3)
  const buf = c.createBuffer(1, len, sr)
  noise(buf, len)
  const src = c.createBufferSource()
  src.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 800
  bp.Q.value = 1.5
  const env = c.createGain()
  env.gain.setValueAtTime(0.4, c.currentTime)
  env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3)
  src.connect(bp).connect(env).connect(c.destination)
  src.start()
}

export function playCorrect(): void {
  const c = getCtx()
  const now = c.currentTime
  for (let i = 0; i < 3; i++) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = [523, 659, 784][i]
    const env = c.createGain()
    env.gain.setValueAtTime(0.2, now + i * 0.1)
    env.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3)
    osc.connect(env).connect(c.destination)
    osc.start(now + i * 0.1)
    osc.stop(now + i * 0.1 + 0.3)
  }
}

export function playWrong(): void {
  const c = getCtx()
  const now = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = 150
  const env = c.createGain()
  env.gain.setValueAtTime(0.15, now)
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  osc.connect(env).connect(c.destination)
  osc.start(now)
  osc.stop(now + 0.25)
}

export function playTyping(): void {
  const c = getCtx()
  const now = c.currentTime
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.02), c.sampleRate)
  noise(buf, buf.length)
  const src = c.createBufferSource()
  src.buffer = buf
  const env = c.createGain()
  env.gain.setValueAtTime(0.06, now)
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.02)
  src.connect(env).connect(c.destination)
  src.start(now)
}

export function playComplete(): void {
  const c = getCtx()
  const now = c.currentTime
  const notes = [523, 659, 784, 1047]
  for (let i = 0; i < notes.length; i++) {
    const osc = c.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = notes[i]
    const env = c.createGain()
    env.gain.setValueAtTime(0.25, now + i * 0.12)
    env.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5)
    osc.connect(env).connect(c.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.5)
  }
}
