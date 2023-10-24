/* https://dev.to/ndesmic/splines-from-scratch-catmull-rom-3m66 */
import { Vec2 } from '@geomm/api'
import { vec2 } from '@geomm/maths'
import { CurveFn } from './api'

export const catmullRomSpline: CurveFn = (points, t) => {
  const i = Math.floor(t)
  const p0 = points[i]
  const p1 = points[i + 1]
  const p2 = points[i + 2]
  const p3 = points[i + 3]

  if (points.length <= i + 3) {
    //out of bounds then clamp
    return points[points.length - 2]
  }

  const remainderT = t - i

  const q0 = -1 * remainderT ** 3 + 2 * remainderT ** 2 + -1 * remainderT
  const q1 = 3 * remainderT ** 3 + -5 * remainderT ** 2 + 2
  const q2 = -3 * remainderT ** 3 + 4 * remainderT ** 2 + remainderT
  const q3 = remainderT ** 3 - remainderT ** 2

  return vec2(
    0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3),
    0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3),
  )
}

export const catmullRomGradient: CurveFn = (points, t) => {
  const i = Math.floor(t)
  const p0 = points[i]
  const p1 = points[i + 1]
  const p2 = points[i + 2]
  const p3 = points[i + 3]

  if (points.length <= i + 3) {
    //out of bounds then clamp
    return points[points.length - 2]
  }

  const remainderT = t - i

  const q0 = -3 * remainderT ** 2 + 4 * remainderT - 1
  const q1 = 9 * remainderT ** 2 + -10 * remainderT
  const q2 = -9 * remainderT ** 2 + 8 * remainderT + 1
  const q3 = 3 * remainderT ** 2 - 2 * remainderT

  return vec2(
    0.5 * (p0.x * q0 + p1.x * q1 + p2.x * q2 + p3.x * q3),
    0.5 * (p0.y * q0 + p1.y * q1 + p2.y * q2 + p3.y * q3),
  )
}

export const approximateCurve = (
  curveFn: CurveFn,
  points: Vec2[],
  min: number,
  max: number,
  delta: number,
) => {
  const _points: Vec2[] = []
  for (let t = min; t <= max; t += delta) {
    _points.push(curveFn(points, t))
  }
  return _points
}

export const measureSegments = (segs: Vec2[]) => {
  const lengths = [0] //first point is always at position 0
  let lastPoint = segs[0]
  for (let i = 1; i < segs.length; i++) {
    const currentPoint = segs[i]
    lengths.push(
      Math.sqrt(
        (currentPoint.x - lastPoint.x) ** 2 +
          (currentPoint.y - lastPoint.y) ** 2,
      ),
    )
    lastPoint = currentPoint
  }
  return lengths
}

export const normalizeCurve = (
  curveFn: CurveFn,
  points: Vec2[],
  max: number,
  delta: number,
) => {
  const segmentLengths = [0] //first point is always position 0
  for (let i = 1; i <= max; i++) {
    const approximatePoints = approximateCurve(curveFn, points, i - 1, i, delta)
    const approximationSegmentLengths = measureSegments(approximatePoints)
    const length = approximationSegmentLengths.reduce((sum, l) => sum + l, 0)
    segmentLengths.push(length)
  }
  const maxLength = segmentLengths.reduce((sum, l) => sum + l, 0)

  return (t: number) => {
    if (t < 0) {
      return curveFn(points, 0)
    } else if (t > 1) {
      return curveFn(points, 1)
    }

    const currentLength = t * maxLength
    let totalSegmentLength = 0
    let segmentIndex = 0
    while (
      currentLength >
      totalSegmentLength + segmentLengths[segmentIndex + 1]
    ) {
      segmentIndex++
      totalSegmentLength += segmentLengths[segmentIndex]
    }

    const segmentLength = segmentLengths[segmentIndex + 1]
    const remainderLength = currentLength - totalSegmentLength
    const fractionalRemainder = remainderLength / segmentLength
    return curveFn(points, segmentIndex + fractionalRemainder)
  }
}
