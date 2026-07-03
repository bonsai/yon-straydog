import { completeCurrentSpot } from '../map/hub'
import { playCorrect, playWrong } from './sound'

interface MatchItem {
  figure: string
  hint: string
  era: string
}

interface MatchConfig {
  title: string
  items: MatchItem[]
}

export function startMatchGame(config: MatchConfig): void {
  // Reuse puyo-game container
  const container = document.getElementById('puyo-game')
  if (!container) return

  let round = 0
  let mistakes = 0

  const allEras = config.items.map(i => i.era)
  // Shuffle eras for each round
  function shuffledEras(excludeIdx: number): string[] {
    const others = allEras.filter((_, i) => i !== excludeIdx)
    const arr = [allEras[excludeIdx], ...others]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const style = document.createElement('style')
  style.textContent = `
    .match-era-btn{padding:10px 16px;background:#1a1a2e;border:1px solid #333;border-radius:8px;color:#e0e0e0;font-size:.9rem;cursor:pointer;text-align:center;transition:all .15s}
    .match-era-btn:active{background:#2a2a3e;border-color:#ffd700}
    .match-era-btn.correct{background:#0a1a0a!important;border-color:#4caf50!important;color:#4caf50}
    .match-era-btn.wrong{background:#1a0a0a!important;border-color:#c62828!important;color:#c62828}
  `
  document.head.appendChild(style)

  function render(): void {
    if (round >= config.items.length) {
      container.innerHTML = `
        <div style="padding:40px 20px;text-align:center">
          <div style="font-size:3rem">🎉</div>
          <h3 style="color:#ffd700;margin:12px 0">全問正解！</h3>
          <p style="color:#888">ミス: ${mistakes} 回</p>
        </div>
      `
      playCorrect()
      setTimeout(() => {
        container.innerHTML = ''
        container.style.display = 'none'
        style.remove()
        completeCurrentSpot()
      }, 1500)
      return
    }

    const item = config.items[round]
    const eras = shuffledEras(round)

    container.innerHTML = `
      <div style="padding:20px;max-width:360px;margin:0 auto">
        <h3 style="text-align:center;color:#ffd700;margin-bottom:4px">${config.title}</h3>
        <p style="text-align:center;color:#888;font-size:.75rem;margin-bottom:16px">${round + 1}/${config.items.length} 問目</p>
        <div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:16px;text-align:center;margin-bottom:16px">
          <div style="font-size:1.3rem;color:#e0e0e0;margin-bottom:4px">${item.figure}</div>
          <div style="font-size:.8rem;color:#888">${item.hint}</div>
        </div>
        <div style="font-size:.85rem;color:#888;text-align:center;margin-bottom:8px">この人物が活躍した時代は？</div>
        <div id="match-choices" style="display:flex;flex-direction:column;gap:8px"></div>
        <p id="match-fb" style="text-align:center;min-height:1.5em;margin-top:12px"></p>
      </div>
    `

    const choicesEl = document.getElementById('match-choices')!
    const fbEl = document.getElementById('match-fb')!
    let answered = false

    eras.forEach(era => {
      const btn = document.createElement('button')
      btn.className = 'match-era-btn'
      btn.textContent = era
      btn.addEventListener('click', () => {
        if (answered) return
        answered = true

        if (era === item.era) {
          btn.classList.add('correct')
          fbEl.innerHTML = '<span style="color:#4caf50">✅ 正解！</span>'
          playCorrect()
          setTimeout(() => { round++; render() }, 800)
        } else {
          btn.classList.add('wrong')
          // Highlight correct answer
          choicesEl.querySelectorAll('.match-era-btn').forEach(b => {
            if ((b as HTMLElement).textContent === item.era) b.classList.add('correct')
          })
          fbEl.innerHTML = '<span style="color:#c62828">❌ はずれ</span>'
          mistakes++
          playWrong()
          setTimeout(() => { round++; render() }, 1200)
        }
      })
      choicesEl.appendChild(btn)
    })
  }

  container.style.display = 'flex'

  document.addEventListener('keydown', function escHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      container.style.display = 'none'
      container.innerHTML = ''
      style.remove()
      document.removeEventListener('keydown', escHandler)
    }
  })

  render()
}
