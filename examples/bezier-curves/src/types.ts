import type { Vec2 } from '@geomm/api'

export type Curve = [Vec2, Vec2, Vec2, Vec2]

export type CurveDesc = {
  id: string | null
  curve: Curve
  prev: Curve
  frames: Curve[]
}

export type PointDesc = {
  id: string | null
  pointIdx: number
}

export type State = {
  selected: PointDesc[]
  animate: boolean
  frame: number
  curves: CurveDesc[]
}
