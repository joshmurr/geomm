import type { Vec2 } from '@geomm/api'

export const getHashBucketIndex = (cellPos: Vec2, numBuckets: number) => {
  const h1 = 0x8da6b343 // Large multiplicative constants;
  const h2 = 0xd8163841 // here arbitrarily chosen primes
  let n = h1 * cellPos.x + h2 * cellPos.y
  n = n % numBuckets
  if (n < 0) n += numBuckets
  return n
}

export const getCellPos = (pos: Vec2, cellSize: number) => {
  const x = Math.floor(pos.x / cellSize)
  const y = Math.floor(pos.y / cellSize)
  return { x, y }
}

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  width: number,
  height: number,
) => {
  const numCellsX = Math.ceil(width / cellSize)
  const numCellsY = Math.ceil(height / cellSize)
  ctx.strokeStyle = '#aaa'
  ctx.lineWidth = 0.5
  for (let x = 0; x < numCellsX; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize, 0)
    ctx.lineTo(x * cellSize, height)
    ctx.stroke()
  }
  for (let y = 0; y < numCellsY; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize)
    ctx.lineTo(width, y * cellSize)
    ctx.stroke()
  }
}

export const drawGridNumbered = (
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  width: number,
  height: number,
) => {
  const numCellsX = Math.ceil(width / cellSize)
  const numCellsY = Math.ceil(height / cellSize)
  ctx.strokeStyle = '#ddd'
  ctx.fillStyle = '#ddd'
  ctx.lineWidth = 0.8
  ctx.font = '10px monospace'

  for (let x = 0; x < numCellsX; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize, 0)
    ctx.lineTo(x * cellSize, height)
    ctx.stroke()
    ctx.fillText(x.toString(), x * cellSize + 2, 10)
  }

  for (let y = 0; y < numCellsY; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize)
    ctx.lineTo(width, y * cellSize)
    ctx.stroke()
    ctx.fillText(y.toString(), 2, y * cellSize + 10)
  }
}

export const drawGridCell = (
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  cellPos: Vec2,
) => {
  const x = cellPos.x * cellSize
  const y = cellPos.y * cellSize
  ctx.strokeStyle = '#f00'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + cellSize, y)
  ctx.lineTo(x + cellSize, y + cellSize)
  ctx.lineTo(x, y + cellSize)
  ctx.closePath()
  ctx.stroke()
}
