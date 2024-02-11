// Matrices
import type { Mat3, Mat4, NumericArray, Vec3 } from '@geomm/api'
import { mat4 as glMat4, vec3 as glVec3 } from 'gl-matrix'
import type { TransformationBlock } from './api'
import { ensureVec3 } from './vectors'
import { vec3 } from './vec3'

export const identityMat = () => glMat4.create()

export const viewMat = () =>
  /* TODO: Return from values */
  glMat4.lookAt(
    glMat4.create(),
    glVec3.fromValues(0, 0, 2), // Pos
    glVec3.fromValues(0, 0, 0), // Target
    glVec3.fromValues(0, 1, 0), // Up
  )

export const projectionMat = (): glMat4 => {
  /* TODO: Return from values */
  const fieldOfView = (45 * Math.PI) / 180
  const aspect = 1
  const zNear = 0.1
  const zFar = 100.0

  return glMat4.perspective(glMat4.create(), fieldOfView, aspect, zNear, zFar)
}

export const translate3D = (m: glMat4, translate: glVec3 | NumericArray) => {
  return glMat4.translate(m, m, ensureVec3(translate))
}

export const rotateAngleAxis3D = (
  m: glMat4,
  angle: number,
  axis: glVec3 | NumericArray,
) => {
  return glMat4.rotate(m, m, angle, ensureVec3(axis))
}

export const matFromTransformations = ({
  translation,
  rotation,
  scale,
}: TransformationBlock): glMat4 => {
  const m = identityMat()
  const { angle, axis } = rotation
  glMat4.translate(m, m, ensureVec3(translation))
  glMat4.rotate(m, m, angle, ensureVec3(axis))
  glMat4.scale(m, m, ensureVec3(scale))

  return m
}

export const applyTransformations = (
  m: glMat4,
  { translation, rotation, scale }: TransformationBlock,
): glMat4 => {
  const { angle, axis } = rotation
  glMat4.translate(m, m, ensureVec3(translation))
  glMat4.rotate(m, m, angle, ensureVec3(axis))
  glMat4.scale(m, m, ensureVec3(scale))

  return m
}

export const normalMatFromModel = (modelViewMat: glMat4) => {
  const normalMatrix = glMat4.create()
  glMat4.invert(normalMatrix, modelViewMat)
  glMat4.transpose(normalMatrix, normalMatrix)

  return normalMatrix
}

export const mat4 = (): Mat4 => {
  const m = Array.from({ length: 4 * 4 }).fill(0)
  m[0] = 1
  m[5] = 1
  m[10] = 1
  m[15] = 1
  return m as Mat4
}

export const matMulV3 = (m: Mat3, v: Vec3) => {
  const x = m[0] * v[0] + m[3] * v[1] + m[6] * v[2]
  const y = m[1] * v[0] + m[4] * v[1] + m[7] * v[2]
  const z = m[2] * v[0] + m[5] * v[1] + m[8] * v[2]
  return vec3(x, y, z)
}

export const matMulM4 = (a: Mat4, b: Mat4): Mat4 => {
  const out = mat4()
  const a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3]
  const a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7]
  const a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11]
  const a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15]

  // Cache only the current line of the second matrix
  let b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3]
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

  b0 = b[4]
  b1 = b[5]
  b2 = b[6]
  b3 = b[7]
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

  b0 = b[8]
  b1 = b[9]
  b2 = b[10]
  b3 = b[11]
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

  b0 = b[12]
  b1 = b[13]
  b2 = b[14]
  b3 = b[15]
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
  return out
}
