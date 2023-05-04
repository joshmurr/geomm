import { vec } from '@geomm/geometry'
import type { State } from './types'

export const genUUID = (len: number) =>
  Math.random().toString(36).substring(2, len)

export const defaultState: State = {
  selected: { id: null, pointIdx: -1 },
  curves: [
    {
      id: genUUID(4),
      points: [vec(100, 200), vec(60, 80), vec(120, 300), vec(500, 400)],
    },
    {
      id: genUUID(4),
      points: [vec(500, 400), vec(160, 180), vec(70, 60), vec(300, 280)],
    },
  ],
}
