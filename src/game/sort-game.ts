import { completeCurrentSpot } from '../map/hub'
import { playCorrect, playWrong } from './sound'

interface SortItem {
  text: string
}

interface SortConfig {
  title: string
  items: SortItem[]
}

export function startSortGame(config: SortConfig): void {
  // Reuse simon-game container
  const container = document.getElementById('simon-game')
  if (!container) return

  // Clear and build sort UI
  container.innerHTML = `
    <div style="padding:20px;max-width:360px;margin:0 auto">
      <h3 style="text-align:center;color:#ffd700;margin-bottom:8px">${config.title}</h3>
      <p style="text-align:center;color:#888;font-size:.8rem;margin-bottom:16px">タップで入れ替え→古い順に並べて</p>
      <div id="sort-list" style="display:flex;flex-direction:column;gap:8px"></div>
      <p id="sort-fb" style="text-align:center;margin-top:16px;min-height:1.5em"></p>
      <button id="sort-check" style="display:block;margin:12px auto 0;padding:10px 32px;background:#ffd700;color:#0a0a0f;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:bold">確認</button>
    </div>
  `

  const listEl = document.getElementById('sort-list')!
  const fbEl = document.getElementById('sort-fb')!
  const checkBtn = document.getElementById('sort-check') as HTMLButtonElement

  let order: number[] = config.items.map((_, i) => i)
  let selected: number | null = null

  function render(): void {
    listEl.innerHTML = ''
    order.forEach((origIdx, pos) => {
      const item = config.items[origIdx]
      const div = document.createElement('div')
      div.style.cssText = `padding:12px;background:${selected === pos ? '#2a2a4e' : '#1a1a2e'};border:1px solid ${selected === pos ? '#ffd700' : '#333'};border-radius:8px;cursor:pointer;color:#e0e0e0;font-size:.95rem;transition:background .15s`
      div.textContent = `${pos + 1}. ${item.text}`
      div.addEventListener('click', () => {
        if (selected === null) {
          selected = pos
        } else if (selected === pos) {
          selected = null
        } else {
          [order[selected], order[pos]] = [order[pos], order[selected]]
          selected = null
        }
        render()
      })
      listEl.appendChild(div)
    })
  }

  checkBtn.addEventListener('click', () => {
    const correct = order.every((origIdx, pos) => origIdx === pos)
    if (correct) {
      fbEl.innerHTML = '<span style="color:#4caf50">✅ 正解！</span>'
      playCorrect()
      checkBtn.disabled = true
      setTimeout(() => {
        container.innerHTML = ''
        completeCurrentSpot()
      }, 1200)
    } else {
      fbEl.innerHTML = '<span style="color:#c62828">❌ ちがうみたい…</span>'
      playWrong()
    }
  })

  container.style.display = 'flex'
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      container.style.display = 'none'
      container.innerHTML = ''
    }
  }, { once: true })

  render()
}
