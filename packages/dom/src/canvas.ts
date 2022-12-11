import { aspect } from '@geomm/maths'
import { createEl } from './core'

export const canvas = (width: number, height: number) => {
  const c = createEl<HTMLCanvasElement>('canvas')
  c.width = width
  c.height = height
  return c
}

export const canvasAspect = (c: HTMLCanvasElement) => {
  return aspect(c.width, c.height)
}
