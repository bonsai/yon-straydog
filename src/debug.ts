// =====================================================
// DEBUG FEATURES — DELETE THIS FILE TO REMOVE ALL
// =====================================================
// Also delete in main.ts: the `if (DEBUG) initDebug()` call
// Also delete in index.html: #puyo-game, #simon-game, #quiz4-game, #spot-hub, #story-mode
// Also delete in style.css: #story-mode, #puyo-game, #simon-game, #quiz4-game, #spot-hub sections
// =====================================================
import { useDogStore } from './store'
import { SPOTS } from './game/spots'
import { INTRO_LINES } from './story/data'
import { createPuyoState, movePiece, rotatePiece, hardDrop, tick } from './game/puyo/logic'
import { createCanvas, drawFrame } from './game/puyo/view'
import { STATION_EMOJIS } from './game/puyo/types'
import { createSimonState, generateSequence, tapNote, advance } from './game/simon/logic'
import { createSimonCanvas, drawSimon, playNote, clickTest } from './game/simon/view'
import type { Spot } from './game/spots'
import { type Option, some, none, isNone, isSome, match } from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

// Hooks set by main.ts for debug features to call
export interface DebugHooks {
  switchScreen: (from: string, to: string) => void
  showScreen: (id: string) => void
  showComplete: () => void
  start4x4Puzzle: () => void
  hideEl: (id: string) => void
  showEl: (id: string, display?: string) => void
}

let hooks: DebugHooks | null = null

export function setHooks(h: DebugHooks): void {
  hooks = h
}

// =====================================================
// SPOT HUB
// =====================================================
export let currentGameSpot: string | null = null

export function completeCurrentSpot(): void {
  if (currentGameSpot) {
    const store = useDogStore.getState()
    if (!store.completed.includes(currentGameSpot)) store.completeSpot(currentGameSpot)
    currentGameSpot = null
  }
  const hub = document.getElementById('spot-hub')
  if (hub) { hub.style.display = 'flex'; renderHub() }
}

function isSpotUnlocked(id: string, completed: string[]): boolean {
  if (id === 's0' || id === 's1') return true
  if (id === 's2') return completed.includes('s0') && completed.includes('s1')
  if (id === 's3') return completed.includes('s0') && completed.includes('s1') && completed.includes('s2')
  return false
}

function spotLockReason(id: string): string {
  if (id === 's2') return 'まず さぼうる と 響 を巡ろう'
  if (id === 's3') return '3つのヒント玉を集めよう'
  return '🔒'
}

function renderHub(): void {
  const grid = document.getElementById('hub-grid')
  const balls = document.getElementById('hub-balls')
  if (!grid) return
  const { completed } = useDogStore.getState()

  grid.innerHTML = SPOTS.map(s => {
    const done = completed.includes(s.id)
    const locked = !done && !isSpotUnlocked(s.id, completed)
    return `<div class="hub-card ${done?'done':locked?'locked':'open'}" data-id="${s.id}" style="background:${locked?'#111':done?'#0a1a0a':'#1a1a2e'};border:1px solid ${locked?'#222':done?'#2a5a2a':'#333'};border-radius:12px;padding:12px;text-align:center;cursor:${locked?'default':'pointer'};opacity:${locked?'.4':'1'}">
      <div style="font-size:1.8rem;margin-bottom:4px">${done?'✅':locked?'🔒':s.icon}</div>
      <div style="color:${done?'#4caf50':locked?'#555':'#ffd700'};font-size:.75rem;font-weight:bold;margin-bottom:2px">${s.name}</div>
      <div style="color:#666;font-size:.65rem;line-height:1.3">${done?'クリア！':locked?spotLockReason(s.id):s.hint}</div>
    </div>`
  }).join('')

  const ballSpots = SPOTS.filter(s => s.id !== 's3' && (isSpotUnlocked(s.id, completed) || completed.includes(s.id)))
  if (balls) balls.innerHTML = ballSpots.map(s => completed.includes(s.id) ? '🟡' : '⚪').join('')

  grid.querySelectorAll('.hub-card.open').forEach(el => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id
      if (!id) return
      const starter = (window as any).__gameStarters?.[id]
      if (starter) {
        currentGameSpot = id
        document.getElementById('spot-hub')!.style.display = 'none'
        starter()
      } else if (id === 's3') {
        useDogStore.getState().completeSpot('s3')
        if (hooks) hooks.showComplete()
      }
    })
  })
}

export function startSpotHub(): void {
  const el = document.getElementById('spot-hub')
  if (!el) return
  el.style.display = 'flex'
  if (hooks) hooks.hideEl('puzzle4')
  renderHub()
}

// =====================================================
// STORY MODE
// =====================================================
interface StoryScene {
  icon: string; title: string; paragraphs: string[]
}

const STORY_SCENES: StoryScene[] = [
  { icon: '📖', title: '幕1: 出会い — YON 2F', paragraphs: ['壁のQRコードを読み取ると、','そこには ひと組の夫妻の姿があった。','','「あの…すみません。」','「うちの犬がいなくなってしまったんです。」','「妻が妊娠中で、動けなくて…どうか…」','','あなたは夫妻の代わりに、','犬を探すことにした——','夫妻は一枚の写真を差し出した。','だが——写真は砕け散っている。','','元に戻せば、なにかがわかる。'] },
  { icon: '🌈', title: '幕2-1: さぼうる', paragraphs: ['さぼうる名物7色クリームソーダ。虹の色を数えて。','','窓辺のテーブル。犬はいつもこのグラスを見つめていた。','','——犬の記憶','"ここには、いつもガラスが揺れていた。','　店主の手がくり出す無数のつぼみ。','　赤、橙、黄、緑、青、藍、紫——','　一度だけ、皿のすきまをくぐってベロを舐めたら','　炭酸がはじけて、メロンの匂いがした。','　あの頃、まだ　夫は一人だった。"'] },
  { icon: '🔔', title: '幕2-2: 響（野外彫刻）', paragraphs: ['丸山ともみ作「響」。曲線が風を受けて鳴らなかった音。','','犬は曲線に耳を寄せていた。金属の奥で、かすかな響き。','','——犬の記憶','"風の強い午後、私はここで座り込んだ。','　金属のカーブが風をかみ砕いて、','　聞こえるはずのない音を聞かせてくれた。','　夫が来たのはそのあとだ。','　リードを握った手が震えていた。','　彼は何か言いたそうだったが、','　結局、何も言わなかった。"'] },
  { icon: '🗽', title: '幕2-3: 神田橋公園', paragraphs: ['金色に輝く豊展観守像。その名をよく見て。','','金の像の前で立ち止まる。もうすぐだ。','','——犬の記憶','"ここで人はいちばん金ピカだ。','　じっとして、一ミリも動かない。','　ときどき鳩が頭にとまるが、','　それでも動かない。すごいぞ。','　私は3秒も待てない。','','　あの日、二人はこの像の前で立ち止まった。','　妻が言った。「私たち、親になるんだね」','　夫はうなずいて、私の頭を撫でた。"'] },
  { icon: '🎵', title: '幕2-4: YON 3F リビングミュージック', paragraphs: ['階段を上がる。音楽が近づく。','犬は——ずっとここで、','真空管アンプの音に耳をすませていた。','','——犬の記憶','"ここはあったかい。','　電気が通るとガラスが光る。','　人間はあれを「真空管」と呼ぶ。','　あの小さい光の中に、バッハがいるらしい。','　私はバッハが誰か知らないけど、','　音を聴いていると眠くなる。','　夫と妻が探しているのも知ってる。','　でも、もう少しだけ——','　ここにいたい。"'] },
  { icon: '🐕', title: '幕3: 再会 — YON 3F', paragraphs: ['犬を見つけた！','','足跡をたどって辿り着くと——','そこには犬がいた。','','📞 夫妻に電話','「見つかりましたよ。大丈夫です。」','電話の向こうで、妻の泣き声が聞こえた。'] },
  { icon: '🎵', title: '幕4: Goldberg 層へ', paragraphs: ['犬は階段のほうを向いた。','','「こっちだよ」と言うように、','しっぽを一度、大きく振る。','','妻のお腹が大きくなる頃には、','きっと、この街のすべての音が','バッハの変奏に聴こえる。','','尾張家の鍋がふつふつと鳴り、','響の彫刻がかすかに震え、','豊展観守が金のまぶたを細め、','さぼうるのクリームソーダが','虹の炭酸をはじけさせる。','','Goldberg 層へ。','君は最初の音に、たどり着いた。'] },
  { icon: '🐾', title: '補足: 犬の言い訳（全編）', paragraphs: ['さぼうるの窓辺はいい匂いがする。','メロンと炭酸と、古い革の匂い。','クリームソーダの緑をずっと見ていたら、','なんだか外に出たくなった。','ごめん、夫くん。ごめん、妻さん。','','響の彫刻は、風の日は鳴らない。','それなのに、耳を当てると低い音がしている。','誰にも聞こえない音。私にだけは、聞こえている。','','金色の像は動かない。','でも、鳩が頭に乗っても微動だにしないなんて、','すごいよね。私には無理。あと3秒で駆け出しちゃう。','','3階に来たら、思い出した。','ここだ。ここだった。','真空管の光は、さぼうるのメロンソーダと同じ色。','ずっと探してた音が、ここにあった。','ただそれだけなんだ。ただそれだけで——','ずいぶん遠くまで来ちゃったね。'] },
]

let storySceneIdx = 0

function renderStoryScene(): void {
  const scene = STORY_SCENES[storySceneIdx]
  const iconEl = document.getElementById('story-mode-icon')
  const titleEl = document.getElementById('story-mode-title')
  const textEl = document.getElementById('story-mode-text')
  const prevBtn = document.getElementById('story-mode-prev')
  const nextBtn = document.getElementById('story-mode-next') as HTMLButtonElement | null
  if (!iconEl || !titleEl || !textEl || !prevBtn || !nextBtn) return
  iconEl.textContent = scene.icon
  titleEl.textContent = scene.title
  textEl.innerHTML = scene.paragraphs.map(p => {
    if (!p) return '<br>'
    if (p.startsWith('"')) return `<p class="dog-thought">${p}</p>`
    if (p.includes('→ 答え:')) return `<p class="highlight">${p}</p>`
    if (p.startsWith('——')) return `<p class="divider">${p}</p>`
    return `<p>${p}</p>`
  }).join('')
  prevBtn.classList.toggle('hidden-btn', storySceneIdx === 0)
  nextBtn.textContent = storySceneIdx >= STORY_SCENES.length - 1 ? '閉じる ✕' : '次へ ▶'
}

// =====================================================
// MINI-GAMES: PUYO
// =====================================================
let puyoState = createPuyoState(0)
let puyoAnimId: number | null = null
let puyoKeys: Set<string> = new Set()
let puyoRunning = false
let puyoDelay = 0
const PUYO_INTERVAL = 28

function startPuyoGame(targetColor: number): void {
  const el = document.getElementById('puyo-game')
  const label = document.getElementById('puyo-station-label')
  if (!el) return
  el.style.display = 'flex'
  const station = STATION_EMOJIS[targetColor]
  if (label) label.textContent = `${station.emoji} ${station.station}`
  puyoState = createPuyoState(targetColor)
  const canvas = createCanvas()
  if (!canvas) return
  const wrap = document.getElementById('puyo-canvas')
  if (wrap) { wrap.innerHTML = ''; wrap.appendChild(canvas) }
  puyoKeys.clear(); puyoDelay = 0; puyoRunning = true
  document.addEventListener('keydown', puyoKeydown)
  document.addEventListener('keyup', puyoKeyup)
  if (puyoAnimId) cancelAnimationFrame(puyoAnimId)
  const loop = () => {
    if (!puyoRunning) return; puyoDelay++
    if (puyoState.phase === 'playing') {
      if (puyoKeys.has('ArrowDown')) puyoState = movePiece(puyoState, 0)
      if (puyoDelay % 5 === 0) {
        if (puyoKeys.has('ArrowLeft')) puyoState = movePiece(puyoState, -1)
        else if (puyoKeys.has('ArrowRight')) puyoState = movePiece(puyoState, 1)
      }
      if (puyoDelay % PUYO_INTERVAL === 0) puyoState = tick(puyoState)
    }
    const ctx = canvas.getContext('2d')
    if (ctx) drawFrame(ctx, puyoState)
    puyoAnimId = requestAnimationFrame(loop)
  }
  puyoAnimId = requestAnimationFrame(loop)
}
function puyoKeydown(e: KeyboardEvent): void {
  puyoKeys.add(e.key)
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault()
  if (puyoState.phase !== 'playing') return
  switch (e.key) {
    case 'ArrowLeft':  puyoState = movePiece(puyoState, -1); break
    case 'ArrowRight': puyoState = movePiece(puyoState, 1); break
    case 'ArrowUp':    puyoState = rotatePiece(puyoState); break
    case ' ':          puyoState = hardDrop(puyoState); break
    case 'Escape':     closePuyoGame(); break
  }
}
function puyoKeyup(e: KeyboardEvent): void { puyoKeys.delete(e.key) }
function closePuyoGame(): void {
  puyoRunning = false
  const el = document.getElementById('puyo-game')
  if (el) el.style.display = 'none'
  document.removeEventListener('keydown', puyoKeydown)
  document.removeEventListener('keyup', puyoKeyup)
  if (puyoAnimId) { cancelAnimationFrame(puyoAnimId); puyoAnimId = null }
  if (puyoState.phase === 'done') completeCurrentSpot()
}

// =====================================================
// MINI-GAMES: SIMON
// =====================================================
let simonState = createSimonState()
let simonAnimId: number | null = null
let simonShowIdx = 0
let simonShowTimer = 0
let simonRunning = false

function startSimon(): void {
  const el = document.getElementById('simon-game')
  if (!el) return; el.style.display = 'flex'
  simonState = generateSequence(createSimonState())
  simonShowIdx = 0; simonShowTimer = 0; simonRunning = true
  const canvas = createSimonCanvas()
  const wrap = document.getElementById('simon-canvas')
  if (wrap) { wrap.innerHTML = ''; wrap.appendChild(canvas) }
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const hit = clickTest({ offsetX: x, offsetY: y })
    if (hit === null) return
    if (simonState.phase === 'showing') return
    if (simonState.phase === 'correct' || simonState.phase === 'wrong') {
      simonState = advance(simonState); simonShowIdx = 0; simonShowTimer = 0; return
    }
    if (simonState.phase === 'clear') { closeSimon(); return }
    playNote(hit); simonState = tapNote(simonState, hit)
  })
  document.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') closeSimon() })
  if (simonAnimId) cancelAnimationFrame(simonAnimId)
  const loop = () => {
    if (!simonRunning) return
    if (simonState.phase === 'showing') {
      simonShowTimer++
      if (simonShowTimer === 1) {
        const noteIdx = simonState.sequence[simonShowIdx]
        playNote(noteIdx); simonState = { ...simonState, activeNote: noteIdx }
      } else if (simonShowTimer === 20) {
        simonState = { ...simonState, activeNote: null }; simonShowIdx++; simonShowTimer = 0
        if (simonShowIdx >= simonState.sequence.length) simonState = { ...simonState, phase: 'input', activeNote: null }
      }
    }
    const ctx = canvas.getContext('2d')
    if (ctx) drawSimon(ctx, simonState)
    simonAnimId = requestAnimationFrame(loop)
  }
  simonAnimId = requestAnimationFrame(loop)
}
function closeSimon(): void {
  simonRunning = false
  const el = document.getElementById('simon-game')
  if (el) el.style.display = 'none'
  if (simonAnimId) { cancelAnimationFrame(simonAnimId); simonAnimId = null }
  if (simonState.phase === 'clear') completeCurrentSpot()
}

// =====================================================
// MINI-GAMES: 4CHAR QUIZ
// =====================================================
const QUIZ4_ACCEPT = ['よりみち', 'ヨリミチ', '寄り道']
const QUIZ4_EXACT = '寄り道'
let quiz4Solved = false

function startQuiz4(): void {
  quiz4Solved = false
  const el = document.getElementById('quiz4-game')
  if (el) el.style.display = 'flex'
  const input = document.getElementById('quiz4-input') as HTMLInputElement | null
  const fb = document.getElementById('quiz4-fb')
  if (input) { input.value = ''; input.focus() }
  if (fb) fb.textContent = ''
}
function closeQuiz4(): void {
  const el = document.getElementById('quiz4-game')
  if (el) el.style.display = 'none'
}

// =====================================================
// INIT: wire debug features
// =====================================================
export function initDebug(): void {
  // Register game starters
  (window as any).__gameStarters = {
    s0: () => startPuyoGame(0),
    s1: startSimon,
    s2: startQuiz4,
  }

  // Override puzzle-complete hook: after 4x4 puzzle, show hub
  (window as any).__onPuzzleComplete = startSpotHub

  // Story mode buttons
  document.getElementById('d-story')?.addEventListener('click', () => {
    storySceneIdx = 0
    const el = document.getElementById('story-mode')
    if (el) el.style.display = 'flex'
    renderStoryScene()
  })
  document.getElementById('story-mode-next')?.addEventListener('click', () => {
    if (storySceneIdx >= STORY_SCENES.length - 1) {
      const el = document.getElementById('story-mode')
      if (el) el.style.display = 'none'; return
    }
    storySceneIdx++; renderStoryScene()
  })
  document.getElementById('story-mode-prev')?.addEventListener('click', () => {
    if (storySceneIdx <= 0) return; storySceneIdx--; renderStoryScene()
  })

  // Mini-game debug buttons
  const addBtn = (text: string, fn: () => void) => {
    const b = document.createElement('button')
    b.className = 'dbtn gold'; b.textContent = text; b.addEventListener('click', fn)
    document.getElementById('d-story')?.parentElement?.insertBefore(b, document.getElementById('d-story'))
  }
  addBtn('🐕 4×4パズル', () => {
    useDogStore.getState().setIntroDone()
    if (hooks) { hooks.switchScreen('intro', 'puzzle4'); hooks.start4x4Puzzle() }
  })
  addBtn('🧩 ぷよぷよ', () => startPuyoGame(0))
  addBtn('🎵 音当て', startSimon)
  addBtn('✍️ 4字クイズ', startQuiz4)

  // Quiz4 submit handler
  const q4btn = document.getElementById('quiz4-btn')
  if (q4btn) q4btn.addEventListener('click', () => {
    const input = document.getElementById('quiz4-input') as HTMLInputElement | null
    const fb = document.getElementById('quiz4-fb')
    if (!input || !fb) return
    const val = input.value.trim()
    if (val && QUIZ4_ACCEPT.includes(val)) {
      fb.textContent = `✅ 正解！「${QUIZ4_EXACT}」`; fb.style.color = '#4caf50'
      quiz4Solved = true
      const btn = document.getElementById('quiz4-btn') as HTMLButtonElement | null
      if (btn) { btn.textContent = '✓ クリア！'; btn.onclick = () => { closeQuiz4(); completeCurrentSpot() } }
    } else if (val) {
      fb.textContent = '❌ 違うよ。もう一度考えてみて。'; fb.style.color = '#ef5350'
      input.value = ''; input.focus()
    } else {
      fb.textContent = '答えを入力してね'; fb.style.color = '#888'
    }
  })
}
