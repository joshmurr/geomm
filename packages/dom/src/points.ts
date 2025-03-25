import { Vec2 } from '@geomm/api'

type Opts = {
  radius?: number
  fillStyle?: string
  font?: string
  offset?: Vec2
  lineWidth?: number
  strokeStyle?: string
}

export const drawPoint = (
  ctx: CanvasRenderingContext2D,
  { x, y }: Vec2,
  { fillStyle = 'red', radius = 2 }: Opts = {},
) => {
  ctx.fillStyle = fillStyle
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()
}

export const drawCross = (
  ctx: CanvasRenderingContext2D,
  { x, y }: Vec2,
  { fillStyle = 'red', radius = 2 }: Opts = {},
) => {
  ctx.fillStyle = fillStyle
  ctx.beginPath()
  ctx.moveTo(x - radius, y - radius)
  ctx.lineTo(x + radius, y + radius)
  ctx.moveTo(x + radius, y - radius)
  ctx.lineTo(x - radius, y + radius)
  ctx.stroke()
}

export const drawLabel = (
  ctx: CanvasRenderingContext2D,
  text: string,
  { x, y }: Vec2,
  { fillStyle = 'black', font = '12px sans-serif' }: Opts = {},
) => {
  ctx.fillStyle = fillStyle
  ctx.font = font
  ctx.fillText(text, x, y)
}

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  points: Vec2[],
  { strokeStyle = 'black', lineWidth = 1 }: Opts = {},
) => {
  points.forEach((p, i) => {
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)

    if (i === points.length - 1) {
      ctx.lineTo(points[0].x, points[0].y)
    } else {
      ctx.lineTo(points[i + 1].x, points[i + 1].y)
    }

    ctx.stroke()
  })
}
