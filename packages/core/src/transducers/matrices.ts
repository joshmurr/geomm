import { Reducer } from '../api'
import { partial } from '../base'
import { transduce } from '../transducer'
import { mat4 } from 'gl-matrix'

const matMul = partial(mat4.mul, mat4.create())
export const combineMatrices = (ms: mat4[]) =>
  transduce(
    (rf: Reducer<mat4>) => (m1: mat4, m2: mat4) => rf(m1, m2),
    matMul,
    mat4.create(),
    ms,
  )
