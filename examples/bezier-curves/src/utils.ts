import { lerp } from '@geomm/geometry'
import type { Curve } from './types'

export const lerpCurve = (curveA: Curve, curveB: Curve, t: number) => {
  const [startA, cp1A, cp2A, endA] = curveA
  const [startB, cp1B, cp2B, endB] = curveB
  const start = lerp(startA, startB, t)
  const cp1 = lerp(cp1A, cp1B, t)
  const cp2 = lerp(cp2A, cp2B, t)
  const end = lerp(endA, endB, t)
  return [start, cp1, cp2, end] as Curve
}
