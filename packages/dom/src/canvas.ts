import { createEl } from './core'

export const canvas = (width: number, height: number) => {
  const c = createEl<HTMLCanvasElement>('canvas')
  c.width = width
  c.height = height
  return c
}
