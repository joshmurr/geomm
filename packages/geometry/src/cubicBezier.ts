/*
 * https://www.geeksforgeeks.org/cubic-bezier-curve-implementation-in-c/
 */

import { add, pow, scale } from '@geomm/maths'
import { CurveFn } from './api'

export const cubicBezier: CurveFn = (points, t) => {
  const i = Math.floor(t)
  const p0 = points[i]
  const p1 = points[i + 1]
  const p2 = points[i + 2]
  const p3 = points[i + 3]

  if (points.length <= i + 3) {
    //out of bounds then clamp
    return points[points.length - 2]
  }

  const a = scale(p0, pow(1 - t, 3))
  const b = scale(p1, 3 * t * pow(1 - t, 2))
  const c = scale(p2, 3 * pow(t, 2) * (1 - t))
  const d = scale(p3, pow(t, 3))

  return add(add(a, b), add(c, d))
}
