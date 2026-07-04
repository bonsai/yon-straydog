import { createPuzzleState, isSolved, selectOrSwap, type PuzzleState } from './puzzle'
import { completeCurrentSpot } from '../map/hub'
import { playCorrect } from './sound'
import bgImage from '/gdog-square.png'

export function PuzzleStarter(): void {
  const SIZE = 2
  let pState: PuzzleState = createPuzzleState(true, SIZE)

  const gameEl = document.getElementById('puzzle4')
  const grid = document.getElementById('puzzle4-grid')
  const status = document.getElementById('puzzle4-status')
  const solvedHint = document.getElementById('p4-solved-hint')
  const goBtn = document.getElementById('p4-go') as HTMLButtonElement
  if (!gameEl || !grid || !status || !solvedHint || !goBtn) return

  gameEl.style.display = 'flex'
  solvedHint.style.display = 'none'
  goBtn.classList.remove('show')

  function renderGrid(): void {
    grid.innerHTML = ''
    for (let i = 0; i < pState.tiles.length; i++) {
      const t = pState.tiles[i]
      const row = Math.floor(t.currentPos / SIZE)
      const col = t.currentPos % SIZE
      const div = document.createElement('div')
      div.className = 'p4-tile'
      div.style.backgroundImage = `url(${bgImage})`
      if (pState.selectedIdx !== null && pState.selectedIdx === i) div.classList.add('selected')
      if (t.currentPos === t.correctPos) div.classList.add('in-place')
      div.style.backgroundPosition = `${col * 100}% ${row * 100}%`
      div.dataset.idx = String(i)
      div.addEventListener('click', () => onTap(i))
      grid.appendChild(div)
    }
    status.textContent = `操作: ${pState.moves} 回`
  }

  function onTap(idx: number): void {
    if (goBtn.classList.contains('show')) return
    pState = selectOrSwap(pState, idx)
    renderGrid()
    if (pState.selectedIdx === null && isSolved(pState)) onSolved()
  }

  function onSolved(): void {
    status.textContent = `🎉 完成！ ${pState.moves} 回でクリア`
    grid.querySelectorAll('.p4-tile').forEach(el => {
      el.classList.add('solved-flash', 'in-place')
    })
    if (navigator.vibrate) navigator.vibrate([50, 30, 50])
    playCorrect()
    setTimeout(() => {
      solvedHint.style.display = 'block'
      goBtn.classList.add('show')
    }, 500)
  }

  goBtn.addEventListener('click', () => {
    gameEl.style.display = 'none'
    completeCurrentSpot()
  }, { once: true })

  document.getElementById('puzzle4-close')?.addEventListener('click', () => {
    gameEl.style.display = 'none'
    completeCurrentSpot()
  }, { once: true })

  renderGrid()
}
