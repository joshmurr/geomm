// Matrices
import type { NumericArray } from '@geomm/api'
import { mat4, vec3 } from 'gl-matrix'
import type { TransformationBlock } from './api'
import { ensureVec3 } from './vectors'

export const identityMat = () => mat4.create()

export const viewMat = () =>
  /* TODO: Return from values */
  mat4.lookAt(
    mat4.create(),
    vec3.fromValues(0, 0, 2), // Pos
    vec3.fromValues(0, 0, 0), // Target
    vec3.fromValues(0, 1, 0), // Up
  )

export const projectionMat = (): mat4 => {
  /* TODO: Return from values */
  const fieldOfView = (45 * Math.PI) / 180
  const aspect = 1
  const zNear = 0.1
  const zFar = 100.0

  return mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar)
}

export const translate3D = (m: mat4, translate: vec3 | NumericArray) => {
  return mat4.translate(m, m, ensureVec3(translate))
}

export const rotateAngleAxis3D = (
  m: mat4,
  angle: number,
  axis: vec3 | NumericArray,
) => {
  return mat4.rotate(m, m, angle, ensureVec3(axis))
}

export const matFromTransformations = ({
  translation,
  rotation,
  scale,
}: TransformationBlock): mat4 => {
  const m = identityMat()
  const { angle, axis } = rotation
  mat4.translate(m, m, ensureVec3(translation))
  mat4.rotate(m, m, angle, ensureVec3(axis))
  mat4.scale(m, m, ensureVec3(scale))

  return m
}

export const applyTransformations = (
  m: mat4,
  { translation, rotation, scale }: TransformationBlock,
): mat4 => {
  const { angle, axis } = rotation
  mat4.translate(m, m, ensureVec3(translation))
  mat4.rotate(m, m, angle, ensureVec3(axis))
  mat4.scale(m, m, ensureVec3(scale))

  return m
}
