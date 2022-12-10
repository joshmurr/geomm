import { canvas } from '@geomm/dom'
import type { WGL2Canvas, WGL2RC } from './api'

export const webgl2Canvas = (width: number, height: number): WGL2Canvas => {
  const c = canvas(width, height)
  const gl = c.getContext('webgl2') as WGL2RC
  return [c, gl]
}
