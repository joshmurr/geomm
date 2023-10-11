import { mat4, vec4 } from 'gl-matrix'
import type { MeshBufferGroup } from '@geomm/api'
/* import { combineMatrices } from '@geomm/core' */

const transformVec = (v: vec4, m: mat4) =>
  vec4.transformMat4(vec4.create(), v, m)

export const labelVertices = (
  ctx: CanvasRenderingContext2D,
  shape: MeshBufferGroup,
  mat: mat4,
) => {
  const { canvas: c } = ctx
  ctx.clearRect(0, 0, c.width, c.height)
  const positions = shape.buffers.find((b) =>
    b.attributes.find((a) => a.name === 'i_Position'),
  )?.data
  if (!positions) return
  for (let i = 0; i < positions.length; i += 3) {
    const p = positions.slice(i, i + 3)
    /* const mvp = combineMatrices([pMat, vMat, modelMat]) */
    const clipspace = transformVec(vec4.fromValues(p[0], p[1], p[2], 1), mat)

    // divide X and Y by W just like the GPU does.
    clipspace[0] /= clipspace[3]
    clipspace[1] /= clipspace[3]

    // convert from clipspace to pixels
    const pixelX = (clipspace[0] * 0.5 + 0.5) * c.width
    const pixelY = (clipspace[1] * -0.5 + 0.5) * c.height

    // save all the canvas settings
    ctx.save()

    // translate the canvas origin so 0, 0 is at
    // the top front right corner of our F
    ctx.translate(pixelX, pixelY)
    ctx.rotate(i * Math.PI * 0.8)

    /* ctx.font = `${scale}px monospace` */
    const fill = `rgba(255,255,255,${clipspace[2] - 7 > 0 ? 0.5 : 1})`
    ctx.fillStyle = fill
    ctx.strokeStyle = fill
    // draw an arrow
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(15, 15)
    ctx.stroke()

    // draw the text.
    ctx.fillText((i / 3).toString(), 20, 20)

    // restore the canvas to its old settings.
    ctx.restore()
  }
}
