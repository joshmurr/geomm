import { Vec2 } from '@geomm/api'

type Opts = {
  radius?: number
  fillStyle?: string
  font?: string
  offset?: Vec2
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
