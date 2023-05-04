import type { Vec } from './api'

export const vec = (x: number, y: number) => ({ x, y })

export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y
export const cross = (a: Vec, b: Vec) => a.x * b.y - a.y * b.x
export const normalize = (a: Vec) => {
  const len = Math.sqrt(dot(a, a))
  return vec(a.x / len, a.y / len)
}

export const dist = (a: Vec, b: Vec) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export const lerp = (a: Vec, b: Vec, t: number) => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return vec(a.x + dx * t, a.y + dy * t)
}
