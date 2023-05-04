import type { Vec } from '@geomm/geometry/lib/api'

export type Curve = [Vec, Vec, Vec, Vec]

export type CurveDesc = {
  id: string | null
  points: Curve
}

export type PointDesc = {
  id: string | null
  pointIdx: number
}

export type State = {
  selected: PointDesc
  curves: CurveDesc[]
}
