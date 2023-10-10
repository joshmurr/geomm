import { Reducer, partial, transduce } from '@geomm/core'
import { appendEl, canvas2d } from '@geomm/dom'
import { indexedIcosahedron } from '@geomm/geometry'
import {
  centroid3Float,
  cos,
  matFromTransformations,
  projectionMat,
  sin,
  viewMat,
} from '@geomm/maths'
import { mat4, vec4 } from 'gl-matrix'

const [c, ctx] = canvas2d(512, 512)
appendEl(c)

const vMat = viewMat()
const pMat = projectionMat()

const matMul = partial(mat4.mul, mat4.create())
const combineMatrices = (ms: mat4[]) =>
  transduce(
    (rf: Reducer<mat4>) => (m1: mat4, m2: mat4) => rf(m1, m2),
    matMul,
    mat4.create(),
    ms,
  )

const transformVec = (v: vec4, m: mat4) =>
  vec4.transformMat4(vec4.create(), vec4.fromValues(v[0], v[1], v[2], 1), m)

const { buffers, indices } = indexedIcosahedron
const positions = buffers.find((b) =>
  b.attributes.find((a) => a.name === 'i_Position'),
)?.data

if (!positions) throw new Error('No positions found')

const toClipspace = (v: vec4, m: mat4) => {
  const clipspace = transformVec(v, m)

  // divide X and Y by W just like the GPU does.
  clipspace[0] /= clipspace[3]
  clipspace[1] /= clipspace[3]

  // convert from clipspace to pixels
  const pixelX = (clipspace[0] * 0.5 + 0.5) * c.width
  const pixelY = (clipspace[1] * -0.5 + 0.5) * c.height

  return [pixelX, pixelY]
}

const toUint8 = (n: number) => Math.floor(n * 256)

const faceColors = Array.from({ length: indices.length / 3 }, () => {
  const r = toUint8(Math.random())
  const g = toUint8(Math.random())
  const b = toUint8(Math.random())
  return `#${((r << 16) | (g << 8) | (b << 0)).toString(16)}`
})

const draw = (time: number) => {
  const smallTime = time * 0.001

  const modelMat = matFromTransformations({
    translation: [0, 0, -6],
    rotation: {
      axis: [cos(sin(smallTime)), cos(sin(smallTime)), sin(cos(smallTime))],
      angle: smallTime,
    },
    scale: [1, 1, 1],
  })

  const mvp = combineMatrices([pMat, vMat, modelMat])

  const centroids = new Map()

  ctx.clearRect(0, 0, c.width, c.height)

  for (let i = 0; i < indices.length; i += 3) {
    const ids = indices.slice(i, i + 3)
    /* const is = indices.slice(i, i + 3) */
    const p0 = positions.slice(ids[0] * 3, ids[0] * 3 + 3)
    const p1 = positions.slice(ids[1] * 3, ids[1] * 3 + 3)
    const p2 = positions.slice(ids[2] * 3, ids[2] * 3 + 3)

    const t0 = transformVec(p0, mvp)
    const t1 = transformVec(p1, mvp)
    const t2 = transformVec(p2, mvp)

    const centroidZ = centroid3Float(t0, t1, t2)[2]
    centroids.set(i, centroidZ)
  }

  const ordered = new Map([...centroids.entries()].sort((a, b) => b[1] - a[1]))

  for (const [i] of ordered) {
    const p0 = positions.slice(indices[i + 0] * 3, indices[i + 0] * 3 + 3)
    const p1 = positions.slice(indices[i + 1] * 3, indices[i + 1] * 3 + 3)
    const p2 = positions.slice(indices[i + 2] * 3, indices[i + 2] * 3 + 3)

    const [x0, y0] = toClipspace(p0, mvp)
    const [x1, y1] = toClipspace(p1, mvp)
    const [x2, y2] = toClipspace(p2, mvp)

    ctx.fillStyle = faceColors[i / 3]
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.fill()
  }

  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
