import { Vec2 } from '@geomm/api'

export const vec2 = (x: number, y: number) => ({ x, y })

export const add = (a: Vec2, b: Vec2) => vec2(a.x + b.x, a.y + b.y)

export const sub = (a: Vec2, b: Vec2) => vec2(a.x - b.x, a.y - b.y)

export const mul = (a: Vec2, b: Vec2) => vec2(a.x * b.x, a.y * b.y)

export const div = (a: Vec2, b: Vec2) => vec2(a.x / b.x, a.y / b.y)

export const scale = (a: Vec2, s: number) => vec2(a.x * s, a.y * s)

export const subScalar = (a: Vec2, s: number) => vec2(a.x - s, a.y - s)

export const dot = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y

export const cross = (a: Vec2, b: Vec2) => a.x * b.y - a.y * b.x

export const normalize = (a: Vec2) => {
  const len = Math.sqrt(dot(a, a))
  return vec2(a.x / len, a.y / len)
}

export const mag = (a: Vec2) => Math.sqrt(dot(a, a))

export const distanceSq = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export const distance = (a: Vec2, b: Vec2) => Math.sqrt(distanceSq(a, b))

export const lerp = (a: Vec2, b: Vec2, t: number) => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return vec2(a.x + dx * t, a.y + dy * t)
}

export const toScreen = (v: Vec2, size: Vec2) =>
  vec2(v.x * size.x, v.y * size.y)

export const limit = (v: Vec2, max: number) => {
  const len = dot(v, v)
  const maxSq = max * max
  if (len > maxSq) {
    return scale(v, maxSq / len)
  }
  return v
}
