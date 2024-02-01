import type { Polygon, PhysicsObject2D } from '@geomm/api'
import { vec2 } from '@geomm/maths'
import { RenderingOpts } from './api'

export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  {
    verts,
    pos = vec2(0, 0),
    rotation = 0,
    strokeStyle = 'grey',
    fillStyle = 'lightGrey',
    fill = false,
    stroke = true,
    lineWidth = 1,
  }: RenderingOpts & Polygon,
) => {
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate(rotation)
  ctx.strokeStyle = strokeStyle
  ctx.fillStyle = fillStyle
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  for (let i = 0; i < verts.length; i++) {
    if (i === 0) {
      ctx.moveTo(verts[i].x, verts[i].y)
    } else {
      ctx.lineTo(verts[i].x, verts[i].y)
    }
  }
  ctx.closePath()
  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
  ctx.restore()
}

export const drawAABB = (
  ctx: CanvasRenderingContext2D,
  { pos, rotation, aabb }: PhysicsObject2D,
) => {
  const { center, halfWidth, halfHeight } = aabb
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate(rotation)
  ctx.strokeStyle = 'grey'
  ctx.lineWidth = 3
  ctx.strokeRect(
    center.x - halfWidth,
    center.y - halfHeight,
    halfWidth * 2,
    halfHeight * 2,
  )
  ctx.restore()
}

export const drawBC = (
  ctx: CanvasRenderingContext2D,
  { pos, rotation, bc }: PhysicsObject2D,
) => {
  const { center, radius } = bc
  ctx.save()
  ctx.translate(pos.x, pos.y)
  ctx.rotate(rotation)
  ctx.strokeStyle = 'grey'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.restore()
}
