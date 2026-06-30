import { COLS, ROWS, COLORS, DIR_OFFSET, type PuyoState, type Piece } from './types'

// responsive sizing: fit within viewport
function calcCell(): number {
  const vw = Math.min(window.innerWidth, 400)
  return Math.floor((vw - 24) / COLS)
}

export function createCanvasSize(): { cell: number, w: number, h: number } {
  const cell = calcCell()
  const w = cell * COLS + 8
  const h = cell * ROWS + 8 + 32
  return { cell, w, h }
}

export function createCanvas(): HTMLCanvasElement | null {
  const { cell, w, h } = createCanvasSize()
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.style.width = w + 'px'
  c.style.height = h + 'px'
  return c
}

function drawCell(ctx: CanvasRenderingContext2D, col: number, row: number, colorIdx: number | null, alpha: number, cell: number) {
  const x = 4 + col * cell
  const y = 4 + row * cell
  ctx.globalAlpha = alpha

  if (colorIdx === null) {
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(x, y, cell - 1, cell - 1)
    ctx.globalAlpha = 1
    return
  }

  ctx.font = `${cell - 4}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(COLORS[colorIdx % COLORS.length], x + (cell - 1) / 2, y + (cell - 1) / 2 + 1)
  ctx.globalAlpha = 1
}

export function drawFrame(ctx: CanvasRenderingContext2D, state: PuyoState) {
  const { cell, w, h } = createCanvasSize()
  const { grid, piece, score, clearedGroups, targetColor } = state

  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#111122'
  ctx.fillRect(3, 3, cell * COLS + 2, cell * ROWS + 2)

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      drawCell(ctx, c, r, grid[r][c], 1, cell)
    }
  }

  if (piece && state.phase === 'playing') {
    const ghostRow = computeGhostRow(grid, piece)
    const ghostPiece: Piece = { ...piece, row: ghostRow }
    const cells = pieceCells(ghostPiece)
    for (const [r, c] of cells) {
      const ci = r === ghostRow ? piece.colors[0] : piece.colors[1]
      drawCell(ctx, c, r, ci, 0.2, cell)
    }
  }

  if (piece && state.phase === 'playing') {
    const cells = pieceCells(piece)
    for (const [r, c] of cells) {
      const ci = r === piece.row ? piece.colors[0] : piece.colors[1]
      drawCell(ctx, c, r, ci, 0.9, cell)
    }
  }

  const hudY = cell * ROWS + 10
  ctx.fillStyle = '#ffd700'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`得点: ${score}`, 4, hudY)
  ctx.fillText(`目標: ${COLORS[targetColor % COLORS.length]} x${Math.max(0, 3 - clearedGroups)}`, w / 2 + 4, hudY)

  if (state.phase === 'done') {
    ctx.fillStyle = 'rgba(10,10,15,0.7)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#4caf50'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✓ クリア！', w / 2, h / 2 - 10)
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#aaa'
    ctx.fillText('Escで閉じる', w / 2, h / 2 + 16)
  }
  if (state.phase === 'gameover') {
    ctx.fillStyle = 'rgba(10,10,15,0.7)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ef5350'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', w / 2, h / 2)
  }
}

function pieceCells(piece: Piece): [[number, number], [number, number]] {
  const [dr, dc] = DIR_OFFSET[piece.dir]
  return [
    [piece.row, piece.col],
    [piece.row + dr, piece.col + dc],
  ]
}

function computeGhostRow(grid: (number | null)[][], piece: Piece): number {
  let row = piece.row
  while (true) {
    const next: Piece = { ...piece, row: row + 1 }
    if (!pieceFits(grid, next)) break
    row++
  }
  return row
}

function pieceFits(grid: (number | null)[][], piece: Piece): boolean {
  const cells = pieceCells(piece)
  return cells.every(([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === null)
}
