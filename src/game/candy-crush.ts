import { completeCurrentSpot } from '../map/hub'
import { playCorrect, playWrong } from './sound'

const ROWS = 6
const COLS = 6
const FRUITS = ['🍓', '🍊', '🍋', '🍈', '🍇']
const TARGET_GROUPS = 3

type Cell = number | null
type Grid = Cell[][]

function randomFruit(): number {
  return Math.floor(Math.random() * FRUITS.length)
}

function createGrid(): Grid {
  const g: Grid = []
  for (let r = 0; r < ROWS; r++) {
    g[r] = []
    for (let c = 0; c < COLS; c++) {
      g[r][c] = randomFruit()
    }
  }
  // Remove initial matches
  let had = true
  while (had) {
    had = false
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (g[r][c] === null) continue
        if (c < COLS - 2 && g[r][c] === g[r][c + 1] && g[r][c] === g[r][c + 2]) { g[r][c] = randomFruit(); had = true }
        if (r < ROWS - 2 && g[r][c] === g[r + 1][c] && g[r][c] === g[r + 2][c]) { g[r][c] = randomFruit(); had = true }
      }
    }
  }
  return g
}

function findMatches(g: Grid): Set<string> {
  const matched = new Set<string>()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (g[r][c] === null) continue
      if (c < COLS - 2 && g[r][c] === g[r][c + 1] && g[r][c] === g[r][c + 2]) {
        matched.add(`${r},${c}`); matched.add(`${r},${c + 1}`); matched.add(`${r},${c + 2}`)
      }
      if (r < ROWS - 2 && g[r][c] === g[r + 1][c] && g[r][c] === g[r + 2][c]) {
        matched.add(`${r},${c}`); matched.add(`${r + 1},${c}`); matched.add(`${r + 2},${c}`)
      }
    }
  }
  return matched
}

function applyGravity(g: Grid): void {
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1
    for (let r = ROWS - 1; r >= 0; r--) {
      if (g[r][c] !== null) {
        g[writeRow][c] = g[r][c]
        if (writeRow !== r) g[r][c] = null
        writeRow--
      }
    }
    for (let r = writeRow; r >= 0; r--) {
      g[r][c] = randomFruit()
    }
  }
}

function countGroups(g: Grid): number {
  const visited = new Set<string>()
  let groups = 0
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (g[r][c] === null || visited.has(`${r},${c}`)) continue
      const color = g[r][c]
      const stack: [number, number][] = [[r, c]]
      let count = 0
      while (stack.length) {
        const [cr, cc] = stack.pop()!
        const key = `${cr},${cc}`
        if (visited.has(key)) continue
        if (g[cr][cc] !== color) continue
        visited.add(key)
        count++
        for (const [dr, dc] of dirs) {
          const nr = cr + dr; const nc = cc + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc] === color) {
            stack.push([nr, nc])
          }
        }
      }
      if (count >= 3) groups++
    }
  }
  return groups
}

function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
}

export function startCandyGame(): void {
  const container = document.getElementById('puyo-game')
  if (!container) return

  let grid = createGrid()
  let selected: [number, number] | null = null
  let groupsCleared = 0
  let moves = 0

  const style = document.createElement('style')
  style.textContent = `
    .cc-cell{width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;border-radius:6px;cursor:pointer;transition:transform .1s;background:#111;user-select:none}
    .cc-cell.selected{transform:scale(1.15);box-shadow:0 0 8px #ffd700}
    .cc-cell.matched{animation:ccPop .3s ease-out}
    @keyframes ccPop{0%{transform:scale(1)}50%{transform:scale(1.3)}100%{transform:scale(0);opacity:0}}
  `
  document.head.appendChild(style)

  function render(): void {
    const selKey = selected ? `${selected[0]},${selected[1]}` : ''
    container!.innerHTML = `
      <div style="padding:12px;max-width:320px;margin:0 auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="color:#ffd700;font-weight:bold">🍨 さぼうる</span>
          <span style="color:#888;font-size:.75rem">${groupsCleared}/${TARGET_GROUPS} グループ</span>
        </div>
        <div id="cc-grid" style="display:grid;grid-template-columns:repeat(${COLS},42px);gap:3px;justify-content:center"></div>
        <p style="text-align:center;color:#666;font-size:.7rem;margin-top:8px">同じフルーツを3つ揃える ×3グループでクリア</p>
      </div>
    `
    const gridEl = document.getElementById('cc-grid')!
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const div = document.createElement('div')
        div.className = 'cc-cell'
        if (selected && r === selected[0] && c === selected[1]) div.classList.add('selected')
        if (grid[r][c] !== null) {
          div.textContent = FRUITS[grid[r][c]!]
          div.addEventListener('click', () => onCellClick(r, c))
        }
        gridEl.appendChild(div)
      }
    }
  }

  function flashMatch(keys: Set<string>, cb: () => void): void {
    const cells = document.querySelectorAll('#cc-grid .cc-cell')
    cells.forEach(cell => {
      const r = parseInt(cell.getAttribute('data-r') || '')
      const c = parseInt(cell.getAttribute('data-c') || '')
      if (keys.has(`${r},${c}`)) cell.classList.add('matched')
    })
    setTimeout(cb, 350)
  }

  // Add data attributes for matching
  function patchDataAttrs(): void {
    const cells = document.querySelectorAll('#cc-grid .cc-cell')
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== null) {
          cells[i].setAttribute('data-r', String(r))
          cells[i].setAttribute('data-c', String(c))
          i++
        }
      }
    }
  }

  function onCellClick(r: number, c: number): void {
    if (groupsCleared >= TARGET_GROUPS) return
    if (selected === null) {
      selected = [r, c]; render(); patchDataAttrs(); return
    }
    const [sr, sc] = selected
    if (sr === r && sc === c) { selected = null; render(); return }

    if (!isAdjacent(sr, sc, r, c)) {
      selected = [r, c]; render(); patchDataAttrs(); return
    }

    // Try swap
    [grid[sr][sc], grid[r][c]] = [grid[r][c], grid[sr][sc]]
    selected = null
    moves++
    render()

    const matches = findMatches(grid)
    if (matches.size === 0) {
      // Swap back
      setTimeout(() => {
        [grid[sr][sc], grid[r][c]] = [grid[r][c], grid[sr][sc]]
        playWrong()
        render()
      }, 300)
      return
    }

    // Process matches
    patchDataAttrs()
    const process = () => {
      const m = findMatches(grid)
      if (m.size === 0) {
        groupsCleared = countGroups(grid)
        render()
        if (groupsCleared >= TARGET_GROUPS) onWin()
        return
      }
      flashMatch(m, () => {
        for (const key of m) {
          const [mr, mc] = key.split(',').map(Number)
          grid[mr][mc] = null
        }
        applyGravity(grid)
        render()
        patchDataAttrs()
        setTimeout(process, 200)
      })
    }
    setTimeout(process, 100)
  }

  function onWin(): void {
    playCorrect()
    setTimeout(() => {
      container!.innerHTML = `
        <div style="padding:40px 20px;text-align:center">
          <div style="font-size:3rem">🍨</div>
          <h3 style="color:#ffd700;margin:12px 0">クリア！</h3>
          <p style="color:#888">${moves} 手で ${TARGET_GROUPS} グループ消去</p>
        </div>
      `
      setTimeout(() => {
        container!.style.display = 'none'
        container!.innerHTML = ''
        style.remove()
        completeCurrentSpot()
      }, 1500)
    }, 500)
  }

  container.style.display = 'flex'
  document.addEventListener('keydown', function escH(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      container.style.display = 'none'
      container!.innerHTML = ''
      style.remove()
      document.removeEventListener('keydown', escH)
    }
  })
  render()
}
