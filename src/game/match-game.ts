import { completeCurrentSpot } from '../map/hub'
import { playCorrect, playWrong } from './sound'

interface MatchItem {
  figure: string
  hint: string
  era: string
  altEras?: string[]
}

interface MatchSeries {
  label: string
  items: MatchItem[]
}

interface MatchConfig {
  series: MatchSeries[]
}

const LAYER_ART = [
  { era: '1503年（戦国）', art: 'モナ・リザ', artist: 'ダ・ヴィンチ', title: '時の微笑み' },
  { era: '1657年（江戸）', art: '牛乳を注ぐ女', artist: 'フェルメール', title: '星の乳を注ぐ者' },
  { era: '1881年（明治）', art: '考える人', artist: 'ロダン', title: '思考する巨人' },
  { era: '1907年（大正）', art: '接吻', artist: 'クリムト', title: '銀河の接吻' },
]

export function startMatchGame(config: MatchConfig): void {
  const container = document.getElementById('puyo-game')
  if (!container) return

  // Pick random series
  const series = config.series[Math.floor(Math.random() * config.series.length)]
  const items = series.items
  let round = 0
  let mistakes = 0

  const style = document.createElement('style')
  style.textContent = `
    .match-era-btn{padding:10px 12px;background:#1a1a2e;border:1px solid #333;border-radius:8px;color:#e0e0e0;font-size:.85rem;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px}
    .match-era-btn:active{background:#2a2a3e;border-color:#ffd700}
    .match-era-btn .yr-tag{display:inline-block;padding:1px 8px;border-radius:8px;font-size:.65rem;font-weight:600;color:#000;white-space:nowrap}
    .match-era-btn.correct{background:#0a1a0a!important;border-color:#4caf50!important}
    .match-era-btn.wrong{background:#1a0a0a!important;border-color:#c62828!important}
    .match-layer-card{background:#111;border:1px solid #222;border-radius:6px;padding:4px 8px;text-align:left;font-size:.65rem;color:#777;margin-top:2px}
    .match-layer-card span{color:#aaa}
  `
  document.head.appendChild(style)

  function buildEraChoices(correctEra: string): string[] {
    const correct = LAYER_ART.find(l => l.era === correctEra)!
    const others = LAYER_ART.filter(l => l.era !== correctEra)
    const arr = [correct, ...others]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.map(l => l.era)
  }

  function render(): void {
    if (round >= items.length) {
      container.innerHTML = `
        <div style="padding:40px 20px;text-align:center">
          <div style="font-size:3rem">🎉</div>
          <h3 style="color:#ffd700;margin:12px 0">全問完了！</h3>
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

    const item = items[round]
    const eras = buildEraChoices(item.era)

    container.innerHTML = `
      <div style="padding:16px;max-width:380px;margin:0 auto">
        <div style="text-align:center;margin-bottom:8px">
          <span style="color:#ffd700;font-size:.8rem;font-weight:bold">${series.label}</span>
          <span style="color:#666;font-size:.7rem;margin-left:8px">${round + 1}/${items.length}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:12px">
          ${LAYER_ART.map(l => `
            <div style="background:#111;border-radius:8px;padding:6px 4px;text-align:center;border:1px solid ${eraFor(l.era, eras) === 0 ? '#ffd700' : '#222'}">
              <div style="font-size:.6rem;color:#888">${l.title}</div>
              <div style="font-size:.7rem;color:#aaa">${l.art}</div>
              <div style="font-size:.55rem;color:#666">${l.artist}</div>
              <div style="font-size:.55rem;color:#888;margin-top:2px">${l.era.split('（')[0]}</div>
            </div>
          `).join('')}
        </div>

        <div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:14px;text-align:center;margin-bottom:12px">
          <div style="font-size:1.2rem;color:#e0e0e0;margin-bottom:2px">${item.figure}</div>
          <div style="font-size:.75rem;color:#888">${item.hint}</div>
        </div>
        <div style="font-size:.8rem;color:#888;text-align:center;margin-bottom:8px">どの古層の人物？</div>
        <div id="match-choices" style="display:flex;flex-direction:column;gap:6px"></div>
        <p id="match-fb" style="text-align:center;min-height:1.5em;margin-top:8px"></p>
      </div>
    `

    const choicesEl = document.getElementById('match-choices')!
    const fbEl = document.getElementById('match-fb')!
    let answered = false

    eras.forEach(era => {
      const layer = LAYER_ART.find(l => l.era === era)!
      const btn = document.createElement('button')
      btn.className = 'match-era-btn'
      btn.innerHTML = `<span class="yr-tag" style="background:${tagColor(layer.title)}">${layer.title}</span> ${layer.era}`
      btn.addEventListener('click', () => {
        if (answered) return
        answered = true

        const isCorrect = era === item.era || (item.altEras && item.altEras.includes(era))

        if (isCorrect) {
          btn.classList.add('correct')
          fbEl.innerHTML = '<span style="color:#4caf50">✅ 正解！</span>'
          playCorrect()
          setTimeout(() => { round++; render() }, 800)
        } else {
          btn.classList.add('wrong')
          choicesEl.querySelectorAll('.match-era-btn').forEach(b => {
            const e = (b as HTMLElement).querySelector('.yr-tag')?.nextSibling?.textContent?.trim() || ''
            if (e === item.era || (item.altEras && item.altEras.includes(e))) b.classList.add('correct')
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

  document.addEventListener('keydown', function escH(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      container.style.display = 'none'
      container.innerHTML = ''
      style.remove()
      document.removeEventListener('keydown', escH)
    }
  })

  render()
}

function eraFor(era: string, eras: string[]): number {
  return eras.indexOf(era)
}

function tagColor(title: string): string {
  const map: Record<string, string> = {
    '時の微笑み': '#4fc3f7',
    '星の乳を注ぐ者': '#69db7c',
    '思考する巨人': '#ffa200',
    '銀河の接吻': '#e53935',
  }
  return map[title] || '#ffd700'
}
