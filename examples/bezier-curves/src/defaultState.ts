import { vec } from '@geomm/geometry'
import type { State } from './types'

export const N_FRAMES = 64

export const genUUID = (len: number) =>
  Math.random()
    .toString(36)
    .substring(2, 2 + len)

export const defaultState: State = {
  selected: { id: null, pointIdx: -1 },
  animate: false,
  frame: 0,
  curves: [
    {
      id: genUUID(4),
      curve: [vec(100, 200), vec(60, 80), vec(120, 300), vec(500, 400)],
      prev: [vec(100, 200), vec(60, 80), vec(120, 300), vec(500, 400)],
      frames: Array(N_FRAMES),
    },
    {
      id: genUUID(4),
      curve: [vec(500, 400), vec(160, 180), vec(70, 60), vec(300, 280)],
      prev: [vec(100, 200), vec(60, 80), vec(120, 300), vec(500, 400)],
      frames: Array(N_FRAMES),
    },
  ],
}
