import { Mat4, Vec3, Vec4 } from '@geomm/api'
import { determinant3x3 } from './mat3'
import { cross3, dot3, normalize3 } from './vec3'

/* INFO: Column Major Matrices */

/* prettier-ignore */
export const identity: Mat4 = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

export const matmul = (a: number[], b: number[]) => {
  const n = Math.sqrt(a.length)

  if (n - Math.floor(n) > 0 || n !== Math.sqrt(b.length)) {
    throw new Error('Matrices must be square')
  }

  const result = new Array(n * n).fill(0)

  for (let col = 0; col < n; col++) {
    for (let row = 0; row < n; row++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        /* In column-major format for square matrices:
         * a[row, k] is at index row + k * n
         * b[k, col] is at index k + col * n
         * result[row, col] is at index row + col * n */
        sum += a[row + k * n] * b[k + col * n]
      }
      result[row + col * n] = sum
    }
  }

  return result
}

/* prettier-ignore */
export const translate = (m: Mat4, translate: Vec3 | Vec4): Mat4 => {
  return [
    m[0], m[1], m[2], m[3],
    m[4], m[5], m[6], m[7],
    m[8], m[9], m[10], m[11],
    m[0] * translate.x + m[4] * translate.y + m[8] * translate.z + m[12],
    m[1] * translate.x + m[5] * translate.y + m[9] * translate.z + m[13],
    m[2] * translate.x + m[6] * translate.y + m[10] * translate.z + m[14],
    m[3] * translate.x + m[7] * translate.y + m[11] * translate.z + m[15],
  ]
}

/* prettier-ignore */
export const rotateXMat4 = (angle: number): Mat4 => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ]
}

/* prettier-ignore */
export const rotateYMat4 = (angle: number): Mat4 => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ]
}

/* prettier-ignore */
export const rotateZMat4 = (angle: number): Mat4 => {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [
    c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]
}

/* prettier-ignore */
export const rotateX = (m: Mat4, angle: number): Mat4 => {
  const rotateMat = rotateXMat4(angle)
  return matmul(m, rotateMat) as Mat4
}

/* prettier-ignore */
export const rotateY = (m: Mat4, angle: number): Mat4 => {
  const rotateMat = rotateYMat4(angle)
  return matmul(m, rotateMat) as Mat4
}

/* prettier-ignore */
export const rotateZ = (m: Mat4, angle: number): Mat4 => {
  const rotateMat = rotateZMat4(angle)
  return matmul(m, rotateMat) as Mat4
}

/**
 * Invert a 4x4 matrix stored in column-major format
 * Returns a new matrix that is the inverse of the input matrix
 * If the matrix is not invertible, throws an error
 */
export const invertMatrix4x4 = (m: Mat4): Mat4 => {
  // Early check that we have a 4x4 matrix (16 elements)
  if (m.length !== 16) {
    throw new Error('Matrix must be 4x4 (16 elements)')
  }

  // Extract matrix elements for better readability
  const m00 = m[0],
    m01 = m[1],
    m02 = m[2],
    m03 = m[3]
  const m10 = m[4],
    m11 = m[5],
    m12 = m[6],
    m13 = m[7]
  const m20 = m[8],
    m21 = m[9],
    m22 = m[10],
    m23 = m[11]
  const m30 = m[12],
    m31 = m[13],
    m32 = m[14],
    m33 = m[15]

  // Calculate cofactors
  const c00 = determinant3x3(m11, m12, m13, m21, m22, m23, m31, m32, m33)
  const c01 = -determinant3x3(m10, m12, m13, m20, m22, m23, m30, m32, m33)
  const c02 = determinant3x3(m10, m11, m13, m20, m21, m23, m30, m31, m33)
  const c03 = -determinant3x3(m10, m11, m12, m20, m21, m22, m30, m31, m32)

  const c10 = -determinant3x3(m01, m02, m03, m21, m22, m23, m31, m32, m33)
  const c11 = determinant3x3(m00, m02, m03, m20, m22, m23, m30, m32, m33)
  const c12 = -determinant3x3(m00, m01, m03, m20, m21, m23, m30, m31, m33)
  const c13 = determinant3x3(m00, m01, m02, m20, m21, m22, m30, m31, m32)

  const c20 = determinant3x3(m01, m02, m03, m11, m12, m13, m31, m32, m33)
  const c21 = -determinant3x3(m00, m02, m03, m10, m12, m13, m30, m32, m33)
  const c22 = determinant3x3(m00, m01, m03, m10, m11, m13, m30, m31, m33)
  const c23 = -determinant3x3(m00, m01, m02, m10, m11, m12, m30, m31, m32)

  const c30 = -determinant3x3(m01, m02, m03, m11, m12, m13, m21, m22, m23)
  const c31 = determinant3x3(m00, m02, m03, m10, m12, m13, m20, m22, m23)
  const c32 = -determinant3x3(m00, m01, m03, m10, m11, m13, m20, m21, m23)
  const c33 = determinant3x3(m00, m01, m02, m10, m11, m12, m20, m21, m22)

  // Calculate the determinant using the first row of cofactors
  const det = m00 * c00 + m10 * c10 + m20 * c20 + m30 * c30

  // Check if the matrix is invertible
  if (Math.abs(det) < 1e-8) {
    throw new Error('Matrix is not invertible (determinant is close to zero)')
  }

  // Calculate the inverse by dividing adjugate matrix by determinant
  const invDet = 1.0 / det

  // Return the transposed cofactor matrix divided by the determinant
  // (The transpose happens naturally due to our column-major layout)
  return [
    c00 * invDet,
    c10 * invDet,
    c20 * invDet,
    c30 * invDet,
    c01 * invDet,
    c11 * invDet,
    c21 * invDet,
    c31 * invDet,
    c02 * invDet,
    c12 * invDet,
    c22 * invDet,
    c32 * invDet,
    c03 * invDet,
    c13 * invDet,
    c23 * invDet,
    c33 * invDet,
  ]
}

/**
 * Checks if a matrix is invertible by calculating its determinant
 * Returns true if the matrix is invertible, false otherwise
 */
export const isInvertible = (m: number[]): boolean => {
  try {
    // We only need to calculate the determinant
    const m00 = m[0],
      m01 = m[1],
      m02 = m[2],
      m03 = m[3]
    const m10 = m[4],
      m11 = m[5],
      m12 = m[6],
      m13 = m[7]
    const m20 = m[8],
      m21 = m[9],
      m22 = m[10],
      m23 = m[11]
    const m30 = m[12],
      m31 = m[13],
      m32 = m[14],
      m33 = m[15]

    // Calculate the first row of cofactors
    const c00 = determinant3x3(m11, m12, m13, m21, m22, m23, m31, m32, m33)
    const c10 = -determinant3x3(m01, m02, m03, m21, m22, m23, m31, m32, m33)
    const c20 = determinant3x3(m01, m02, m03, m11, m12, m13, m31, m32, m33)
    const c30 = -determinant3x3(m01, m02, m03, m11, m12, m13, m21, m22, m23)

    // Calculate the determinant
    const det = m00 * c00 + m10 * c10 + m20 * c20 + m30 * c30

    return Math.abs(det) >= 1e-8
  } catch (e) {
    return false
  }
}

/**
 * Transposes a 4x4 matrix stored in column-major format
 * Returns a new matrix that is the transpose of the input matrix
 *
 * In a transposed matrix, rows become columns and columns become rows
 * For a 4x4 matrix, this means swapping elements across the main diagonal
 */
export const transpose = (m: Mat4): Mat4 => {
  // Check that we have a matrix (should be 16 elements for 4x4)
  if (m.length !== 16) {
    throw new Error('Matrix must be 4x4 (16 elements)')
  }

  // Create a new array for the result
  // For a 4x4 matrix in column-major format:
  // [ 0  4  8 12 ]    [ 0 1 2 3 ]
  // [ 1  5  9 13 ] => [ 4 5 6 7 ]
  // [ 2  6 10 14 ]    [ 8 9 10 11]
  // [ 3  7 11 15 ]    [12 13 14 15]
  return [
    m[0],
    m[4],
    m[8],
    m[12],
    m[1],
    m[5],
    m[9],
    m[13],
    m[2],
    m[6],
    m[10],
    m[14],
    m[3],
    m[7],
    m[11],
    m[15],
  ]
}

/**
 * Transposes a square matrix of any size stored in column-major format
 * Returns a new matrix that is the transpose of the input matrix
 */
export const transposeSquare = (m: number[]): number[] => {
  // Calculate the size of the square matrix
  const size = Math.sqrt(m.length)

  // Check that we have a square matrix
  if (size !== Math.floor(size)) {
    throw new Error('Matrix must be square (length must be a perfect square)')
  }

  const n = size
  const result = new Array(m.length)

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      // In column-major format:
      // original[row, col] is at index row + col * n
      // transposed[col, row] is at index col + row * n
      result[col + row * n] = m[row + col * n]
    }
  }

  return result
}

/**
 * Creates a perspective projection matrix
 *
 * @param fovY Field of view in radians (in the Y direction)
 * @param aspect Aspect ratio (width / height)
 * @param near Distance to the near clipping plane (must be positive)
 * @param far Distance to the far clipping plane (must be greater than near)
 * @returns A 4x4 perspective projection matrix in column-major format
 */
export const createPerspectiveMatrix = (
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 => {
  // Input validation
  if (near <= 0) {
    throw new Error('Near clipping plane must be positive')
  }

  if (far <= near) {
    throw new Error('Far clipping plane must be greater than near plane')
  }

  if (aspect <= 0) {
    throw new Error('Aspect ratio must be positive')
  }

  if (fovY <= 0 || fovY >= Math.PI) {
    throw new Error(
      'Field of view must be between 0 and PI radians (exclusive)',
    )
  }

  // Calculate dimensions based on FoV
  const tanHalfFovY = Math.tan(fovY / 2)

  // Calculate matrix coefficients
  const f = 1.0 / tanHalfFovY
  const nf = 1.0 / (near - far)

  // Build the perspective matrix in column-major format
  /* prettier-ignore */
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ];
}

/**
 * Creates an orthographic projection matrix
 *
 * @param left Left boundary of the frustum
 * @param right Right boundary of the frustum
 * @param bottom Bottom boundary of the frustum
 * @param top Top boundary of the frustum
 * @param near Distance to the near clipping plane
 * @param far Distance to the far clipping plane
 * @returns A 4x4 orthographic projection matrix in column-major format
 */
export const createOrthographicMatrix = (
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
): Mat4 => {
  // Input validation
  if (left === right) {
    throw new Error('Left and right cannot be equal')
  }

  if (bottom === top) {
    throw new Error('Bottom and top cannot be equal')
  }

  if (near === far) {
    throw new Error('Near and far cannot be equal')
  }

  // Calculate matrix coefficients
  const lr = 1.0 / (left - right)
  const bt = 1.0 / (bottom - top)
  const nf = 1.0 / (near - far)

  // Build the orthographic matrix in column-major format
  /* prettier-ignore */
  return [
    -2.0 * lr, 0, 0, 0,
    0, -2.0 * bt, 0, 0,
    0, 0, 2.0 * nf, 0,
    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
  ];
}

/**
 * Creates a view matrix that transforms world coordinates to view coordinates
 * Similar to the "lookAt" function in OpenGL/WebGL libraries
 *
 * @param eye Position of the camera
 * @param target Point the camera is looking at
 * @param up Vector pointing upward (typically {x: 0, y: 1, z: 0})
 * @returns A 4x4 view matrix in column-major format
 */
export const createViewMatrix = (eye: Vec3, target: Vec3, up: Vec3): Mat4 => {
  // Input validation
  if (
    (eye.x === target.x && eye.y === target.y && eye.z === target.z) ||
    (up.x === 0 && up.y === 0 && up.z === 0)
  ) {
    throw new Error('Invalid eye, target, or up vector')
  }

  // Calculate the z axis of the camera (forward direction, but negated)
  // We negate it because in typical right-handed coordinate systems,
  // the camera looks down the negative z-axis
  const zAxis = normalize3({
    x: eye.x - target.x,
    y: eye.y - target.y,
    z: eye.z - target.z,
  })

  // Calculate the x axis of the camera (right direction)
  const xAxis = normalize3(cross3(up, zAxis))

  // Calculate the y axis of the camera (up direction)
  const yAxis = cross3(zAxis, xAxis)

  // Build the rotation part of the view matrix
  // We transpose the rotation matrix by placing the axes in rows instead of columns
  // This is equivalent to the inverse of the rotation
  const viewMatrix = [
    xAxis.x,
    yAxis.x,
    zAxis.x,
    0,
    xAxis.y,
    yAxis.y,
    zAxis.y,
    0,
    xAxis.z,
    yAxis.z,
    zAxis.z,
    0,
    0,
    0,
    0,
    1,
  ]

  // Apply the translation part (negative eye position)
  // This is equivalent to the inverse of the translation
  const tx = -dot3(xAxis, eye)
  const ty = -dot3(yAxis, eye)
  const tz = -dot3(zAxis, eye)

  viewMatrix[12] = tx
  viewMatrix[13] = ty
  viewMatrix[14] = tz

  return viewMatrix as Mat4
}

export const normalMat = (modelViewMat: Mat4): Mat4 => {
  const normalMatrix4 = invertMatrix4x4(modelViewMat)
  return transpose(normalMatrix4)
}
