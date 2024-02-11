import type { Mat4, Vec4 } from '@geomm/api'
import { Reducer, transduce } from '@geomm/core'
import { appendEl, canvas2d } from '@geomm/dom'
import { indexedIcosahedron } from '@geomm/geometry'
import {
  centroid3,
  cos,
  mat4,
  matFromTransformations,
  matMulM4,
  projectionMat,
  sin,
  transformMat4,
  vec4,
  viewMat,
} from '@geomm/maths'

const [c, ctx] = canvas2d(512, 512)
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

const { buffers, indices } = indexedIcosahedron
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
  ctx.clearRect(0, 0, c.width, c.height)

  const modelMat = [
    ...matFromTransformations({
      translation: [0, 0, -6],
      rotation: {
        axis: [cos(sin(smallTime)), cos(sin(smallTime)), sin(cos(smallTime))],
        angle: smallTime,
      },
      scale: [1, 1, 1],
    }),
  ] as Mat4

  const mvp = combineMatrices([pMat, vMat, modelMat])

  const centroids = []
  for (let i = 0; i < indices.length; i += 3) {
    const ids = indices.slice(i, i + 3)
    /* const is = indices.slice(i, i + 3) */
    const p0 = positions.slice(ids[0] * 3, ids[0] * 3 + 3)
    const p1 = positions.slice(ids[1] * 3, ids[1] * 3 + 3)
    const p2 = positions.slice(ids[2] * 3, ids[2] * 3 + 3)

    const t0 = transformMat4(vec4(p0[0], p0[1], p0[2], 1), mvp)
    const t1 = transformMat4(vec4(p1[0], p1[1], p1[2], 1), mvp)
    const t2 = transformMat4(vec4(p2[0], p2[1], p2[2], 1), mvp)

    const centroidZ = centroid3(t0, t1, t2).z
    centroids.push({ index: i, centroidZ, face: [t0, t1, t2] })
  }

  centroids.sort((a, b) => b.centroidZ - a.centroidZ)

  centroids.forEach(({ index, face }) => {
    const [x0, y0] = toClipspace(face[0])
    const [x1, y1] = toClipspace(face[1])
    const [x2, y2] = toClipspace(face[2])

    ctx.fillStyle = faceColors[index / 3]
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.fill()

    /* ctx.fillStyle = 'black' */
    /* ctx.fillText(`${index / 3}`, (x0 + x1 + x2) / 3, (y0 + y1 + y2) / 3) */
  })

  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)
