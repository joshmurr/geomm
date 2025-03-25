import type { Mat4, Vec2 } from '@geomm/api'
import { floatRgbToIntRgb, RGB } from '@geomm/color'
import { transformToClipspace } from '@geomm/geometry'
import { vec4 } from '@geomm/maths'

export const labelVertices = (
  ctx: CanvasRenderingContext2D,
  vertices: Float32Array,
  mat: Mat4,
  viewportSize: Vec2,
  color: RGB,
) => {
  const { canvas: c } = ctx
  ctx.clearRect(0, 0, c.width, c.height)

  for (let i = 0; i < vertices.length; i += 3) {
    const p = vertices.slice(i, i + 3)
    const c = transformToClipspace(vec4(p[0], p[1], p[2], 1), mat, viewportSize)

    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.rotate(i * Math.PI * 0.8)

    const fill = `rgba(${floatRgbToIntRgb(color).join(',')}, 0.7)`
    ctx.fillStyle = fill
    ctx.strokeStyle = fill
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(15, 15)
    ctx.stroke()
    ctx.fillText((i / 3).toString(), 20, 20)
    ctx.restore()
  }
}
