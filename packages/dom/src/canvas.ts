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

export const canvas2d = (width: number, height: number) => {
  const c = canvas(width, height)
  const ctx = c.getContext('2d') as CanvasRenderingContext2D
  return [c, ctx] as const
}
