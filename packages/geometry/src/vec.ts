import type { Vec } from './api'

export const vec = (x: number, y: number) => ({ x, y })

export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y
export const cross = (a: Vec, b: Vec) => a.x * b.y - a.y * b.x

export const normalize = (a: Vec) => {
  const len = Math.sqrt(dot(a, a))
  return vec(a.x / len, a.y / len)
}
export const mag = (a: Vec) => Math.sqrt(dot(a, a))

export const distanceSq = (a: Vec, b: Vec) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}
export const distance = (a: Vec, b: Vec) => Math.sqrt(distanceSq(a, b))

export const lerp = (a: Vec, b: Vec, t: number) => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return vec(a.x + dx * t, a.y + dy * t)
}

export const add = (a: Vec, b: Vec) => vec(a.x + b.x, a.y + b.y)
export const sub = (a: Vec, b: Vec) => vec(a.x - b.x, a.y - b.y)
export const mul = (a: Vec, b: Vec) => vec(a.x * b.x, a.y * b.y)
export const div = (a: Vec, b: Vec) => vec(a.x / b.x, a.y / b.y)

export const scale = (a: Vec, s: number) => vec(a.x * s, a.y * s)
export const subScalar = (a: Vec, s: number) => vec(a.x - s, a.y - s)

export const toScreen = (v: Vec, size: Vec) => vec(v.x * size.x, v.y * size.y)

export const limit = (v: Vec, max: number) => {
  const len = dot(v, v)
  const maxSq = max * max
  if (len > maxSq) {
    return scale(v, maxSq / len)
  }
  return v
}
