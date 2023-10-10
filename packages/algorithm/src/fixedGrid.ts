import { Vec2 } from '@geomm/api'

export const fixedGrid = (width: number, height: number, cellSize: number) => {
  const cols = Math.floor(width / cellSize)
  const rows = Math.floor(height / cellSize)
  let cells = Array.from({ length: cols * rows }, () => [] as number[])
  const getCell = (x: number, y: number) => {
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    return cells[row * cols + col]
  }
  const add = (p: Vec2, index: number) => {
    const { x, y } = p
    const cell = getCell(x, y)
    if (!cell) return
    cell.push(index)
  }
  const clear = () => {
    cells = Array.from({ length: cols * rows }, () => [] as number[])
  }
  const neighbours = (p: Vec2, radius: number) => {
    const { x, y } = p
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    const n = Math.floor(radius / cellSize)
    const neighbours = [] as number[]
    for (let i = -n; i <= n; i++) {
      if (i < 0) continue
      if (i > width) continue
      for (let j = -n; j <= n; j++) {
        if (j < 0) continue
        if (j > height) continue
        if (i === 0 && j === 0) continue
        const cell = cells[(row + i) * cols + (col + j)]
        if (cell) {
          neighbours.push(...cell)
        }
      }
    }
    return neighbours
  }
  const cellPos = (idx: number) => {
    const x = idx % cols
    const y = Math.floor(idx / cols)
    return { x: x * cellSize, y: y * cellSize }
  }

  return {
    cols,
    rows,
    cells,
    cellSize,
    getCell,
    cellPos,
    add,
    clear,
    neighbours,
  }
}
