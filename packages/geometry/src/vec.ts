import type { Vec } from './api'

export const vec = (x: number, y: number) => ({ x, y })

export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y
export const cross = (a: Vec, b: Vec) => a.x * b.y - a.y * b.x
export const normalize = (a: Vec) => {
  const len = Math.sqrt(dot(a, a))
  return vec(a.x / len, a.y / len)
}
