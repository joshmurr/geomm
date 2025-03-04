import { EPSILON } from './core.js'

/* https://fotino.me/2d-parametric-collision-detection/ */

export const solveQuadratic2d = (a: number, b: number, c: number) => {
  if (Math.abs(a) < EPSILON) {
    if (Math.abs(b) < EPSILON) {
      if (Math.abs(c) < EPSILON) {
        return [0] // Infinitely many solutions
      } else {
        return []
      }
    } else {
      return [-c / b]
    }
  } else {
    const radicand = b * b - 4 * a * c
    if (Math.abs(radicand) < EPSILON) {
      return [-b / (2 * a)]
    } else if (radicand > 0) {
      const sqrt = Math.sqrt(radicand)
      return [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)]
    } else {
      return [] // Radicand < 0
    }
  }
}
