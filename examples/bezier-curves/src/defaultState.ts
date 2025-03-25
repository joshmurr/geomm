import { vec2 } from '@geomm/maths'
import type { State } from './types'

export const N_FRAMES = 64

export const genUUID = (len: number) =>
  Math.random()
    .toString(36)
    .substring(2, 2 + len)

export const defaultState: State = {
  selected: [],
  animate: false,
  frame: 0,
  curves: [
    {
      id: genUUID(4),
      curve: [vec2(100, 200), vec2(60, 80), vec2(120, 300), vec2(500, 400)],
      prev: [vec2(100, 200), vec2(60, 80), vec2(120, 300), vec2(500, 400)],
      frames: Array(N_FRAMES),
    },
    {
      id: genUUID(4),
      curve: [vec2(500, 400), vec2(160, 180), vec2(70, 60), vec2(300, 280)],
      prev: [vec2(100, 200), vec2(60, 80), vec2(120, 300), vec2(500, 400)],
      frames: Array(N_FRAMES),
    },
  ],
}
