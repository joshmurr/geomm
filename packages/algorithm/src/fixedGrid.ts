import { Vec2 } from '@geomm/api'
import { add, vec2 } from '@geomm/maths'

export const getCellPos = (pos: Vec2, cellSize: number) => {
  const x = Math.floor(pos.x / cellSize)
  const y = Math.floor(pos.y / cellSize)
  return { x, y }
}

export const vec2Id = (v: Vec2) => `${v.x},${v.y}`

type BaseParticle = {
  pos: Vec2
}

export const fixedGrid = <T extends BaseParticle>(
  items: T[],
  cellSize: number,
  callback: (a: T, b: T) => void,
) => {
  const grid = new Map()
  items.forEach((it) => {
    const { pos } = it
    const cellPosTopLeft = getCellPos(
      add(pos, vec2(-cellSize, -cellSize)),
      cellSize,
    )
    const cellPosBottomRight = getCellPos(
      add(pos, vec2(cellSize, cellSize)),
      cellSize,
    )

    for (let i = 0; i <= cellPosBottomRight.x - cellPosTopLeft.x; i++) {
      for (let j = 0; j <= cellPosBottomRight.y - cellPosTopLeft.y; j++) {
        const cellPos = vec2(cellPosTopLeft.x + i, cellPosTopLeft.y + j)
        const idx = vec2Id(cellPos)
        if (!grid.has(idx)) grid.set(idx, [])
        const cell = grid.get(idx)
        cell.push(it)
      }
    }
  })

  for (const bucket of grid.values()) {
    for (let i = 0; i < bucket.length; i++) {
      const p = bucket[i]
      for (let j = i + 1; j < bucket.length; j++) {
        const p2 = bucket[j]
        callback(p, p2)
      }
    }
  }
}
