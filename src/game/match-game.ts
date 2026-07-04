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

  const series = config.series[Math.floor(Math.random() * config.series.length)]
  const items = series.items
  let round = 0
  let mistakes = 0

  const style = document.createElement('style')
  style.textContent = `
    .m-left{flex:1;display:flex;flex-direction:column;gap:8px}
    .m-right{flex:1;display:flex;flex-direction:column;gap:8px}
    .m-fixed{background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:12px;text-align:center;color:#888;font-size:.75rem;min-height:44px;display:flex;align-items:center;justify-content:center}
    .m-drag{background:#2a2a1e;border:2px dashed #555;border-radius:12px;padding:12px;text-align:center;color:#ffd700;font-size:.8rem;cursor:grab;user-select:none;min-height:44px;display:flex;align-items:center;justify-content:center;transition:transform .1s}
    .m-drag:active{cursor:grabbing;transform:scale(1.05)}
    .m-drag.dragging{opacity:.4}
    .m-fixed.correct{background:#0a2a0a!important;border-color:#4caf50!important;color:#4caf50}
    .m-fixed.wrong{background:#1a0a0a!important;border-color:#c62828!important;color:#c62828}
    .m-drag.matched{background:#0a2a0a;border-color:#4caf50;color:#4caf50;cursor:default;pointer-events:none}
  `
  document.head.appendChild(style)

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
    const eraSet = [...new Set(items.map(i => i.era))]
    const shuffledFigures = [...items].sort(() => Math.random() - 0.5)

    container.innerHTML = `
      <div style="padding:16px;max-width:440px;margin:0 auto">
        <div style="text-align:center;margin-bottom:8px">
          <span style="color:#ffd700;font-size:.8rem;font-weight:bold">${series.label}</span>
          <span style="color:#666;font-size:.7rem;margin-left:8px">${round + 1}/${items.length}</span>
        </div>
        <div style="background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:12px;text-align:center;margin-bottom:12px">
          <div style="font-size:1.2rem;color:#e0e0e0;margin-bottom:2px">${item.figure}</div>
          <div style="font-size:.75rem;color:#888">${item.hint}</div>
        </div>
        <div style="font-size:.7rem;color:#888;text-align:center;margin-bottom:8px">人物を 対応する古層にドラッグしてね</div>
        <div id="m-body" style="display:flex;gap:10px">
          <div class="m-left">
            ${LAYER_ART.map(l => `
              <div class="m-fixed" data-era="${l.era}">
                <div style="font-size:.7rem;color:#aaa;font-weight:bold">${l.title}</div>
                <div style="font-size:.6rem;color:#888">${l.art} / ${l.artist}</div>
                <div style="font-size:.55rem;color:#666;margin-top:2px">${l.era.split('（')[0]}</div>
              </div>
            `).join('')}
          </div>
          <div class="m-right">
            ${shuffledFigures.map(f => `<div class="m-drag" draggable="true" data-era="${f.era}">${f.figure}</div>`).join('')}
          </div>
        </div>
        <p id="m-fb" style="text-align:center;min-height:1.5em;margin-top:8px"></p>
      </div>
    `

    let answered = false
    const fbEl = document.getElementById('m-fb')!

    document.querySelectorAll('.m-drag').forEach(d => {
      const el = d as HTMLElement
      el.addEventListener('dragstart', (e) => {
        e.dataTransfer!.setData('text/plain', el.dataset.era!)
        el.classList.add('dragging')
      })
      el.addEventListener('dragend', () => el.classList.remove('dragging'))
    })

    document.querySelectorAll('.m-fixed').forEach(f => {
      f.addEventListener('dragover', e => e.preventDefault())
      f.addEventListener('drop', (e) => {
        e.preventDefault()
        if (answered) return
        answered = true
        const fixed = e.currentTarget as HTMLElement
        const dragEra = e.dataTransfer!.getData('text/plain')
        const fixedEra = fixed.dataset.era!

        const isCorrect = dragEra === item.era || (item.altEras?.includes(dragEra) ?? false)

        if (isCorrect) {
          fixed.classList.add('correct')
          fbEl.innerHTML = '<span style="color:#4caf50">✅ 正解！</span>'
          playCorrect()
          setTimeout(() => { round++; render() }, 800)
        } else {
          fixed.classList.add('wrong')
          document.querySelectorAll('.m-fixed').forEach(ff => {
            const fe = (ff as HTMLElement).dataset.era
            if (fe === item.era || item.altEras?.includes(fe!)) ff.classList.add('correct')
          })
          fbEl.innerHTML = '<span style="color:#c62828">❌ はずれ</span>'
          mistakes++
          playWrong()
          setTimeout(() => { round++; render() }, 1200)
        }
      })
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
