import { appendEl, canvas2d } from '@geomm/dom'
import {
  abs,
  copy,
  cross3,
  floor,
  mat4,
  matFromTransformations,
  matMulM4,
  projectionMat,
  transformMat4,
  vec2,
  vec3,
  vec4,
  viewMat,
} from '@geomm/maths'
import { indexedQuad, indexedCube, indexedIcosahedron } from '@geomm/geometry'
import { Reducer, transduce } from '@geomm/core'
import type { Mat4, Vec2, Vec4 } from '@geomm/api'

const SIZE = vec2(512, 512)
const [c, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(c)

const vMat = [...viewMat()] as Mat4
const pMat = [...projectionMat()] as Mat4

const combineMatrices = (ms: Mat4[]): Mat4 =>
  transduce(
    (rf: Reducer<Mat4>) => (m1: Mat4, m2: Mat4) => rf(m1, m2),
    matMulM4,
    mat4(),
    ms,
  )

const { buffers, indices } = indexedCube
const positions = buffers.find((b) =>
  b.attributes.find((a) => a.name === 'i_Position'),
)?.data

if (!positions) throw new Error('No positions found')

const toClipspace = (v: Vec4) => {
  // divide X and Y by W just like the GPU does.
  v.x /= v.w
  v.y /= v.w

  // convert from clipspace to pixels
  const pixelX = (v.x * 0.5 + 0.5) * c.width
  const pixelY = (v.y * -0.5 + 0.5) * c.height

  return vec2(floor(pixelX), floor(pixelY))
}

const line = (a: Vec2, b: Vec2, color: string) => {
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

const barycentric = (pts: Vec2[], p: Vec2) => {
  const u_ = vec3(pts[2].x - pts[0].x, pts[1].x - pts[0].x, pts[0].x - p.x)
  const u__ = vec3(pts[2].y - pts[0].y, pts[1].y - pts[0].y, pts[0].y - p.y)
  const u = cross3(u__, u_)
  if (abs(u.z) < 1) return vec3(-1, 1, 1)
  return vec3(1 - (u.x + u.y) / u.z, u.y / u.z, u.x / u.z)
}

const triangle = (pts: Vec2[], color: string) => {
  /* Compute bounding box */
  const bboxMin = copy(SIZE)
  const bboxMax = vec2(0, 0)
  const clamp = copy(bboxMin)
  for (let i = 0; i < 3; i++) {
    bboxMin.x = Math.max(0, Math.min(bboxMin.x, pts[i].x))
    bboxMin.y = Math.max(0, Math.min(bboxMin.y, pts[i].y))

    bboxMax.x = Math.min(clamp.x, Math.max(bboxMax.x, pts[i].x))
    bboxMax.y = Math.min(clamp.y, Math.max(bboxMax.y, pts[i].y))
  }
  /* Use BB as limits for Barycentric computation */
  const p = vec2(0, 0)
  for (p.x = bboxMin.x; p.x <= bboxMax.x; p.x++) {
    for (p.y = bboxMin.y; p.y <= bboxMax.y; p.y++) {
      const bcScreen = barycentric(pts, p)
      if (bcScreen.x < 0 || bcScreen.y < 0 || bcScreen.z < 0) continue
      ctx.fillStyle = color
      ctx.fillRect(p.x, p.y, 1, 1)
    }
  }
}

const colors = [
  'red',
  'green',
  'blue',
  'white',
  'yellow',
  'cyan',
  'magenta',
  'orange',
]
const draw = (time: number) => {
  const smallTime = time * 0.001
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)
  ctx.fillStyle = 'white'

  const modelMat = [
    ...matFromTransformations({
      translation: [0, 0, -6],
      rotation: {
        axis: [0, 1, 1],
        angle: 0,
      },
      scale: [1, 1, 1],
    }),
  ] as Mat4

  const mvp = combineMatrices([pMat, vMat, modelMat])
  const clipCoords = [] as Vec2[]
  for (let i = 0; i < indices.length; i += 3) {
    const ids = indices.slice(i, i + 3)
    const p0 = positions.slice(ids[0] * 3, ids[0] * 3 + 3)
    const p1 = positions.slice(ids[1] * 3, ids[1] * 3 + 3)
    const p2 = positions.slice(ids[2] * 3, ids[2] * 3 + 3)

    const t0 = transformMat4(vec4(p0[0], p0[1], p0[2], 1), mvp)
    const t1 = transformMat4(vec4(p1[0], p1[1], p1[2], 1), mvp)
    const t2 = transformMat4(vec4(p2[0], p2[1], p2[2], 1), mvp)

    clipCoords.push(toClipspace(t0))
    clipCoords.push(toClipspace(t1))
    clipCoords.push(toClipspace(t2))
  }
  ctx.strokeStyle = 'red'
  for (let i = 0; i < clipCoords.length; i += 3) {
    triangle(
      [clipCoords[i], clipCoords[i + 1], clipCoords[i + 2]],
      colors[i % colors.length],
    )
    line(clipCoords[i], clipCoords[i + 1], 'white')
    line(clipCoords[i + 1], clipCoords[i + 2], 'white')
    line(clipCoords[i + 2], clipCoords[i], 'white')
  }

  /* requestAnimationFrame(draw) */
}

requestAnimationFrame(draw)
