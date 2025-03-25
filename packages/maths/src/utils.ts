import { Mat4 } from '@geomm/api'
import { Reducer, transduce } from '@geomm/core'
import { identity, matmul } from './mat4'

export const ratio = (a: number, b: number) => a / b
export const aspect = (w: number, h: number) => ratio(w, h)
export const isPowerOf2 = (value: number) => (value & (value - 1)) === 0
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export const combineMatrices = (matrices: Mat4[]): Mat4 =>
  transduce(
    (rf: Reducer<Mat4, Mat4>) => (m1: Mat4, m2: Mat4) => rf(m1, m2),
    matmul,
    identity,
    matrices,
  )
