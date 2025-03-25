import { abs, copy, vec2 } from '@geomm/maths'
import type { Mat4, Vec2, Vec3, Vec4 } from '@geomm/api'

export const line = (a: Vec2, b: Vec2, color: string) => {
  let steep = false
  let a_ = copy(a)
  let b_ = copy(b)
  if (abs(a.x - b.x) < abs(a.y - b.y)) {
    a_.x = a.y
    a_.y = a.x
    b_.y = b.x
    b_.x = b.y

    steep = true
  }

  if (a_.x > b_.x) {
    const a__ = copy(a_)
    const b__ = copy(b_)
    a_ = b__
    b_ = a__
  }

  const dx = b_.x - a_.x
  const dy = b_.y - a_.y
  const derror2 = abs(dy) * 2
  let error2 = 0
  let y = a_.y

  ctx.fillStyle = color
  for (let x = a_.x; x <= b_.x; x++) {
    if (steep) ctx.fillRect(y, x, 1, 1)
    else ctx.fillRect(x, y, 1, 1)
    error2 += derror2
    if (error2 > dx) {
      y += b_.y > a_.y ? 1 : -1
      error2 -= dx * 2
    }
  }
}

export const drawBbox = (min: Vec2, max: Vec2) => {
  const color = '#0f0'
  line(vec2(min.x, min.y), vec2(max.x, min.y), color)
  line(vec2(max.x, min.y), vec2(max.x, max.y), color)
  line(vec2(max.x, max.y), vec2(min.x, max.y), color)
  line(vec2(min.x, max.y), vec2(min.x, min.y), color)
}
