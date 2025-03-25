import { Mat4, Vec4 } from '@geomm/api'

export const vec4 = (x: number, y: number, z: number, w: number) => ({
  x,
  y,
  z,
  w,
})

/**
 * Transforms a 3D vector by a 4x4 matrix, returning a new vector
 */
export const transformVec3 = (
  vec: { x: number; y: number; z: number },
  matrix: Mat4,
) => {
  // For 3D vectors, we use w=1 for points (affected by translation)
  const w = 1

  const result = {
    x:
      matrix[0] * vec.x +
      matrix[4] * vec.y +
      matrix[8] * vec.z +
      matrix[12] * w,
    y:
      matrix[1] * vec.x +
      matrix[5] * vec.y +
      matrix[9] * vec.z +
      matrix[13] * w,
    z:
      matrix[2] * vec.x +
      matrix[6] * vec.y +
      matrix[10] * vec.z +
      matrix[14] * w,
    w:
      matrix[3] * vec.x +
      matrix[7] * vec.y +
      matrix[11] * vec.z +
      matrix[15] * w,
  }

  if (result.w !== 1 && result.w !== 0) {
    return {
      x: result.x / result.w,
      y: result.y / result.w,
      z: result.z / result.w,
    }
  }

  return {
    x: result.x,
    y: result.y,
    z: result.z,
  }
}

/**
 * Transforms a 3D direction vector by a 4x4 matrix, ignoring translation
 * This is useful for normals, directions, etc. that shouldn't be affected by position
 */
export const transformDirection = (
  vec: { x: number; y: number; z: number },
  matrix: number[],
) => {
  // For direction vectors, we use w=0 (not affected by translation)
  const w = 0

  return {
    x:
      matrix[0] * vec.x +
      matrix[4] * vec.y +
      matrix[8] * vec.z +
      matrix[12] * w,
    y:
      matrix[1] * vec.x +
      matrix[5] * vec.y +
      matrix[9] * vec.z +
      matrix[13] * w,
    z:
      matrix[2] * vec.x +
      matrix[6] * vec.y +
      matrix[10] * vec.z +
      matrix[14] * w,
  }
}

/**
 * Transforms a 4D vector by a 4x4 matrix, returning a new vector
 */
export const transformVec4 = (a: Vec4, m: Mat4) => {
  const x = m[0] * a.x + m[4] * a.y + m[8] * a.z + m[12] * a.w
  const y = m[1] * a.x + m[5] * a.y + m[9] * a.z + m[13] * a.w
  const z = m[2] * a.x + m[6] * a.y + m[10] * a.z + m[14] * a.w
  const w = m[3] * a.x + m[7] * a.y + m[11] * a.z + m[15] * a.w
  return vec4(x, y, z, w)
}

/**
 * Transforms a point in 3D space by a 4x4 matrix
 * This is an alias for transformVec3 but makes code intent clearer
 */
export const transformPoint = (
  point: { x: number; y: number; z: number },
  matrix: Mat4,
) => {
  return transformVec3(point, matrix)
}
