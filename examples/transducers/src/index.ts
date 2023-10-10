import {
  compose,
  concat,
  filtering,
  mapping,
  partial,
  transduce,
} from '@geomm/core'
import { Vec, add, mag, vec, vec3 } from '@geomm/geometry'
import { matFromTransformations, projectionMat, viewMat } from '@geomm/maths'
import { mat4 } from 'gl-matrix'

// input data
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// transformations
const add1 = (x: number) => x + 1
const doubleIt = (x: number) => x * 2
/* const add = (x: number, y: number) => x + y */

// predicates
const isEven = (x: number) => x % 2 === 0
const isOdd = (x: number) => !isEven(x)

const filterEven = filtering(isEven)
const addOne = mapping(add1)
const xform = compose(addOne, filterEven)
const transduceResult = transduce(xform, concat, [], nums)

/* console.log(transduceResult) */

/* const vectors = Array.from({ length: 3 }, (_, i) => { */
/*   return vec(i, i + 1) */
/* }) */

const vectors = [vec(2, 3), vec(-3, 8), vec(4, 16)]

const lengths = vectors.map(mag)
const longerThan10 = filtering((v: Vec) => mag(v) > 10)
const transLongerThan10 = transduce(longerThan10, concat, [], vectors)

const transAdd = transduce(
  (rf) => (v1: Vec, v2: Vec) => rf(v1, v2),
  add,
  vec(0, 0),
  vectors,
)

const vector3s = [vec3(2, 3, 4), vec3(-3, 8, 2), vec3(4, 16, 1)]

const pMat = projectionMat()
const vMat = viewMat()
const mMat = matFromTransformations({
  translation: [0, 0, -6],
  rotation: {
    axis: [0, 0, 0],
    angle: 0,
  },
  scale: [1, 1, 1],
})

const matReducer = (rf: any) => (m1: mat4, m2: mat4) => rf(m1, m2)
const addMat = partial(mat4.add, mat4.create())
const matMul = partial(mat4.mul, mat4.create())

const mvp = transduce(matReducer, matMul, mat4.create(), [pMat, vMat, mMat])

console.log(mvp)
