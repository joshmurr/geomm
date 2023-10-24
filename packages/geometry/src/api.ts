import { Vec2 } from '@geomm/api'

export type VertexIds = { [key: number]: [number, number, number] }

export type CurveFn = (p: Vec2[], t: number) => Vec2
