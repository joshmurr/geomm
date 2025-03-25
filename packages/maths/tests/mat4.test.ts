import { expect, describe, it } from 'vitest'
import {
  axisAngleToQuaternion,
  createAxisAngleRotationMatrix,
  createOrthographicMatrix,
  createPerspectiveMatrix,
  createViewMatrix,
  identity,
  invertMatrix4x4,
  isInvertible,
  matmul,
  rotateAxisAngle,
  rotateX,
  rotateXMat4,
  rotateY,
  rotateYMat4,
  rotateZ,
  rotateZMat4,
  translate,
} from '../src/mat4'
import { transformVec4 } from '../src/vec4'
import { Mat4 } from '@geomm/api'

describe('identity', () => {
  it('should be a 4x4 identity matrix', () => {
    expect(identity).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
  })

  it('should not change vectors when multiplied with them', () => {
    const vector = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    const result = matmul(identity, vector)
    expect(result).toEqual(vector)
  })
})

describe('matmul', () => {
  it('multiplies two 4x4 matrices correctly', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

    const expected = [
      90, 100, 110, 120, 202, 228, 254, 280, 314, 356, 398, 440, 426, 484, 542,
      600,
    ]

    const result = matmul(a, a)
    expect(result).toEqual(expected)
  })

  it('multiplies a matrix by identity to get the same matrix', () => {
    const matrix = [5, 2, 8, 4, 1, 6, 3, 9, 7, 4, 2, 5, 3, 8, 1, 6]

    const result = matmul(matrix, identity)
    expect(result).toEqual(matrix)

    const resultReversed = matmul(identity, matrix)
    expect(resultReversed).toEqual(matrix)
  })

  it('handles 2x2 matrices correctly', () => {
    const a = [1, 2, 3, 4]

    const b = [5, 6, 7, 8]

    const expected = [23, 34, 31, 46]

    const result = matmul(a, b)
    expect(result).toEqual(expected)
  })

  it('handles 3x3 matrices correctly', () => {
    const a = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    const b = [9, 8, 7, 6, 5, 4, 3, 2, 1]

    const expected = [90, 114, 138, 54, 69, 84, 18, 24, 30]

    const result = matmul(a, b)
    expect(result).toEqual(expected)
  })

  it('handles matrices with zero entries correctly', () => {
    const a = [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4]

    const b = [5, 0, 0, 0, 0, 6, 0, 0, 0, 0, 7, 0, 0, 0, 0, 8]

    const expected = [5, 0, 0, 0, 0, 12, 0, 0, 0, 0, 21, 0, 0, 0, 0, 32]

    const result = matmul(a, b)
    expect(result).toEqual(expected)
  })

  it('handles the case when n is 1 (scalar multiplication)', () => {
    const a = [5]
    const b = [7]
    const expected = [35]

    const result = matmul(a, b)
    expect(result).toEqual(expected)
  })
})

describe('translate', () => {
  it('applies translation to identity matrix', () => {
    const translation = { x: 10, y: 20, z: 30, w: 1 }
    const result = translate(identity, translation)

    expect(result[12]).toBeCloseTo(10)
    expect(result[13]).toBeCloseTo(20)
    expect(result[14]).toBeCloseTo(30)
    expect(result[15]).toBeCloseTo(1)

    // Upper 3x3 should remain unchanged
    expect(result.slice(0, 12)).toEqual(identity.slice(0, 12))
  })

  it('applies translation to a transformed matrix', () => {
    // Create a matrix with existing translation
    const initialTranslation = { x: 5, y: 10, z: 15, w: 1 }
    const initialMatrix = translate(identity, initialTranslation)

    // Apply additional translation
    const additionalTranslation = { x: 2, y: 3, z: 4, w: 1 }
    const result = translate(initialMatrix, additionalTranslation)

    // Final translation should be cumulative
    expect(result[12]).toBeCloseTo(7) // 5 + 2
    expect(result[13]).toBeCloseTo(13) // 10 + 3
    expect(result[14]).toBeCloseTo(19) // 15 + 4
    expect(result[15]).toBeCloseTo(1)
  })
})

describe('rotateXMat4', () => {
  it('creates identity matrix when angle is 0', () => {
    const result = rotateXMat4(0)

    // Should approximate identity matrix
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('creates correct rotation matrix for 90 degrees', () => {
    const halfPi = Math.PI / 2
    const result = rotateXMat4(halfPi)

    // Expected values for 90-degree rotation around X
    expect(result[0]).toBeCloseTo(1)
    expect(result[5]).toBeCloseTo(0)
    expect(result[6]).toBeCloseTo(1)
    expect(result[9]).toBeCloseTo(-1)
    expect(result[10]).toBeCloseTo(0)
  })

  it('creates correct rotation matrix for 180 degrees', () => {
    const pi = Math.PI
    const result = rotateXMat4(pi)

    // Expected values for 180-degree rotation around X
    expect(result[0]).toBeCloseTo(1)
    expect(result[5]).toBeCloseTo(-1)
    expect(result[6]).toBeCloseTo(0, 0.0001)
    expect(result[9]).toBeCloseTo(0, 0.0001)
    expect(result[10]).toBeCloseTo(-1)
  })
})

describe('rotateYMat4', () => {
  it('creates identity matrix when angle is 0', () => {
    const result = rotateYMat4(0)

    // Should approximate identity matrix
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('creates correct rotation matrix for 90 degrees', () => {
    const halfPi = Math.PI / 2
    const result = rotateYMat4(halfPi)

    // Expected values for 90-degree rotation around Y
    expect(result[0]).toBeCloseTo(0)
    expect(result[2]).toBeCloseTo(-1)
    expect(result[5]).toBeCloseTo(1)
    expect(result[8]).toBeCloseTo(1)
    expect(result[10]).toBeCloseTo(0)
  })

  it('creates correct rotation matrix for 180 degrees', () => {
    const pi = Math.PI
    const result = rotateYMat4(pi)

    // Expected values for 180-degree rotation around Y
    expect(result[0]).toBeCloseTo(-1)
    expect(result[2]).toBeCloseTo(0, 0.0001)
    expect(result[5]).toBeCloseTo(1)
    expect(result[8]).toBeCloseTo(0, 0.0001)
    expect(result[10]).toBeCloseTo(-1)
  })
})

describe('rotateZMat4', () => {
  it('creates identity matrix when angle is 0', () => {
    const result = rotateZMat4(0)

    // Should approximate identity matrix
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('creates correct rotation matrix for 90 degrees', () => {
    const halfPi = Math.PI / 2
    const result = rotateZMat4(halfPi)

    // Expected values for 90-degree rotation around Z
    expect(result[0]).toBeCloseTo(0)
    expect(result[1]).toBeCloseTo(1)
    expect(result[4]).toBeCloseTo(-1)
    expect(result[5]).toBeCloseTo(0)
    expect(result[10]).toBeCloseTo(1)
  })

  it('creates correct rotation matrix for 180 degrees', () => {
    const pi = Math.PI
    const result = rotateZMat4(pi)

    // Expected values for 180-degree rotation around Z
    expect(result[0]).toBeCloseTo(-1)
    expect(result[1]).toBeCloseTo(0, 0.0001)
    expect(result[4]).toBeCloseTo(0, 0.0001)
    expect(result[5]).toBeCloseTo(-1)
    expect(result[10]).toBeCloseTo(1)
  })
})

describe('rotateX', () => {
  // Using the actual rotateX function as it should now work with the updated matmul
  const rotateXTest = rotateX

  it('rotates a point around X axis', () => {
    // Start with identity
    const startMatrix = [...identity] as Mat4

    // Apply a 90-degree rotation around X
    const halfPi = Math.PI / 2
    const result = rotateXTest(startMatrix, halfPi)

    // A point at (0,1,0) should be rotated to approximately (0,0,1)
    const point = { x: 0, y: 1, z: 0, w: 1 }
    const transformedX =
      result[0] * point.x +
      result[4] * point.y +
      result[8] * point.z +
      result[12] * point.w
    const transformedY =
      result[1] * point.x +
      result[5] * point.y +
      result[9] * point.z +
      result[13] * point.w
    const transformedZ =
      result[2] * point.x +
      result[6] * point.y +
      result[10] * point.z +
      result[14] * point.w

    expect(transformedX).toBeCloseTo(0)
    expect(transformedY).toBeCloseTo(0)
    expect(transformedZ).toBeCloseTo(1)
  })
})

describe('rotateY', () => {
  // Using the actual rotateY function
  const rotateYTest = rotateY

  it('rotates a point around Y axis', () => {
    // Start with identity
    const startMatrix = [...identity] as Mat4

    // Apply a 90-degree rotation around Y
    const halfPi = Math.PI / 2
    const result = rotateYTest(startMatrix, halfPi)

    // A point at (0,0,1) should be rotated to approximately (1,0,0)
    const point = { x: 0, y: 0, z: 1, w: 1 }
    const transformedX =
      result[0] * point.x +
      result[4] * point.y +
      result[8] * point.z +
      result[12] * point.w
    const transformedY =
      result[1] * point.x +
      result[5] * point.y +
      result[9] * point.z +
      result[13] * point.w
    const transformedZ =
      result[2] * point.x +
      result[6] * point.y +
      result[10] * point.z +
      result[14] * point.w

    expect(transformedX).toBeCloseTo(1)
    expect(transformedY).toBeCloseTo(0)
    expect(transformedZ).toBeCloseTo(0)
  })
})

describe('rotateZ', () => {
  // Using the actual rotateZ function
  const rotateZTest = rotateZ

  it('rotates a point around Z axis', () => {
    // Start with identity
    const startMatrix = [...identity] as Mat4

    // Apply a 90-degree rotation around Z
    const halfPi = Math.PI / 2
    const result = rotateZTest(startMatrix, halfPi)

    // A point at (1,0,0) should be rotated to approximately (0,1,0)
    const point = { x: 1, y: 0, z: 0, w: 1 }
    const transformedX =
      result[0] * point.x +
      result[4] * point.y +
      result[8] * point.z +
      result[12] * point.w
    const transformedY =
      result[1] * point.x +
      result[5] * point.y +
      result[9] * point.z +
      result[13] * point.w
    const transformedZ =
      result[2] * point.x +
      result[6] * point.y +
      result[10] * point.z +
      result[14] * point.w

    expect(transformedX).toBeCloseTo(0)
    expect(transformedY).toBeCloseTo(1)
    expect(transformedZ).toBeCloseTo(0)
  })
})

describe('invertMatrix4x4', () => {
  it('inverts the identity matrix to itself', () => {
    const invIdentity = invertMatrix4x4(identity)

    // The inverse of identity should be identity
    // Use a custom equality check to handle +0 and -0 as equal
    invIdentity.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('inverts a translation matrix correctly', () => {
    // A translation matrix
    const translationMatrix = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      10,
      20,
      30,
      1, // Translation by (10, 20, 30)
    ] as Mat4

    // Expected inverse: translate by negative values
    const expectedInverse = [
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -10, -20, -30, 1,
    ]

    const result = invertMatrix4x4(translationMatrix)

    // Check result against expected
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(expectedInverse[index])
    })

    // Verify that multiplying by its inverse gives identity
    const product = matmul(translationMatrix, result)
    product.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('inverts a scaling matrix correctly', () => {
    // A scaling matrix
    const scalingMatrix = [
      2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1,
    ] as Mat4

    // Expected inverse: reciprocal of scaling factors
    const expectedInverse = [
      0.5,
      0,
      0,
      0,
      0,
      1 / 3,
      0,
      0,
      0,
      0,
      0.25,
      0,
      0,
      0,
      0,
      1,
    ] as Mat4

    const result = invertMatrix4x4(scalingMatrix)

    // Check result against expected
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(expectedInverse[index])
    })

    // Verify that multiplying by its inverse gives identity
    const product = matmul(scalingMatrix, result)
    product.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('inverts a complex matrix correctly', () => {
    // A more complex matrix
    const complexMatrix = [
      1, 2, 3, 4, 0, 1, 0, 0, 0, 0, 1, 0, 5, 6, 7, 1,
    ] as Mat4

    const inverse = invertMatrix4x4(complexMatrix)

    // Verify that multiplying by its inverse gives identity
    const product = matmul(complexMatrix, inverse)
    product.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index], 0.0001)
    })

    // And the other way around
    const productReversed = matmul(inverse, complexMatrix)
    productReversed.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index], 0.0001)
    })
  })

  it('throws an error for non-invertible matrices', () => {
    // A singular (non-invertible) matrix
    const singularMatrix = [
      1,
      2,
      3,
      4,
      2,
      4,
      6,
      8, // This row is 2× the first row
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ] as Mat4

    expect(() => invertMatrix4x4(singularMatrix)).toThrow()
  })
})

describe('isInvertible', () => {
  it('returns true for invertible matrices', () => {
    expect(isInvertible(identity)).toBe(true)

    const translationMatrix = [
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1,
    ]
    expect(isInvertible(translationMatrix)).toBe(true)

    const rotationMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    expect(isInvertible(rotationMatrix)).toBe(true)
  })

  it('returns false for non-invertible matrices', () => {
    // A singular matrix
    const singularMatrix = [
      1,
      2,
      3,
      4,
      2,
      4,
      6,
      8, // This row is 2× the first row
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ]
    expect(isInvertible(singularMatrix)).toBe(false)

    // Another singular matrix (zero determinant)
    const zeroMatrix = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    expect(isInvertible(zeroMatrix)).toBe(false)
  })
})

describe('createPerspectiveMatrix', () => {
  it('creates a valid perspective matrix with common parameters', () => {
    // Common values: 45-degree FOV, 16:9 aspect ratio, near=0.1, far=100
    const fovY = Math.PI / 4 // 45 degrees
    const aspect = 16 / 9
    const near = 0.1
    const far = 100

    const perspectiveMatrix = createPerspectiveMatrix(fovY, aspect, near, far)

    // Check dimensions
    expect(perspectiveMatrix.length).toBe(16)

    // Check key matrix properties
    // Scale factors should be correct
    const tanHalfFov = Math.tan(fovY / 2)
    const f = 1 / tanHalfFov

    expect(perspectiveMatrix[0]).toBeCloseTo(f / aspect) // X scale
    expect(perspectiveMatrix[5]).toBeCloseTo(f) // Y scale

    // Z values should map near->far to normalized device coordinates
    const nf = 1 / (near - far)
    expect(perspectiveMatrix[10]).toBeCloseTo((far + near) * nf)
    expect(perspectiveMatrix[14]).toBeCloseTo(2 * far * near * nf)

    // Should have perspective division enabled
    expect(perspectiveMatrix[11]).toBe(-1)
  })

  it('transforms points correctly with the perspective matrix', () => {
    const fovY = Math.PI / 4
    const aspect = 1 // Square for simplicity
    const near = 1
    const far = 101

    const perspectiveMatrix = createPerspectiveMatrix(fovY, aspect, near, far)

    // Test a point at the near plane center
    const nearPoint = { x: 0, y: 0, z: -near, w: 1 }
    const nearResult = transformVec4(nearPoint, perspectiveMatrix)

    // After perspective division, z should be mapped to -1 (near plane in NDC)
    expect(nearResult.z / nearResult.w).toBeCloseTo(-1)

    // Test a point at the far plane center
    const farPoint = { x: 0, y: 0, z: -far, w: 1 }
    const farResult = transformVec4(farPoint, perspectiveMatrix)

    // After perspective division, z should be mapped to 1 (far plane in NDC)
    expect(farResult.z / farResult.w).toBeCloseTo(1)
  })

  it('throws an error for invalid parameters', () => {
    // Valid parameters for reference
    const validFovY = Math.PI / 4
    const validAspect = 16 / 9
    const validNear = 0.1
    const validFar = 100

    // Test with negative near plane
    expect(() =>
      createPerspectiveMatrix(validFovY, validAspect, -1, validFar),
    ).toThrow()

    // Test with far plane <= near plane
    expect(() =>
      createPerspectiveMatrix(validFovY, validAspect, validNear, validNear),
    ).toThrow()

    // Test with negative aspect ratio
    expect(() =>
      createPerspectiveMatrix(validFovY, -1, validNear, validFar),
    ).toThrow()

    // Test with invalid FOV (must be between 0 and PI)
    expect(() =>
      createPerspectiveMatrix(-0.1, validAspect, validNear, validFar),
    ).toThrow()
    expect(() =>
      createPerspectiveMatrix(Math.PI, validAspect, validNear, validFar),
    ).toThrow()
  })
})

describe('createOrthographicMatrix', () => {
  it('creates a valid orthographic matrix with common parameters', () => {
    // Common orthographic view volume
    const left = -10
    const right = 10
    const bottom = -10
    const top = 10
    const near = 0.1
    const far = 100

    const orthoMatrix = createOrthographicMatrix(
      left,
      right,
      bottom,
      top,
      near,
      far,
    )

    // Check dimensions
    expect(orthoMatrix.length).toBe(16)

    // Check key matrix properties
    // Scale factors should be correct
    expect(orthoMatrix[0]).toBeCloseTo(-2 / (left - right))
    expect(orthoMatrix[5]).toBeCloseTo(-2 / (bottom - top))
    expect(orthoMatrix[10]).toBeCloseTo(2 / (near - far))

    // Translation factors
    expect(orthoMatrix[12]).toBeCloseTo((left + right) / (left - right))
    expect(orthoMatrix[13]).toBeCloseTo((top + bottom) / (bottom - top))
    expect(orthoMatrix[14]).toBeCloseTo((far + near) / (near - far))

    // W component preserved
    expect(orthoMatrix[15]).toBe(1)
  })

  it('transforms points correctly with the orthographic matrix', () => {
    const left = -1
    const right = 1
    const bottom = -1
    const top = 1
    const near = 1
    const far = 101

    const orthoMatrix = createOrthographicMatrix(
      left,
      right,
      bottom,
      top,
      near,
      far,
    )

    // Test corners of the view volume to ensure they map to correct NDC
    const corners = [
      { x: left, y: bottom, z: -near, w: 1 }, // near bottom left
      { x: right, y: top, z: -far, w: 1 }, // far top right
    ]

    // Near bottom left should map to (-1, -1, -1) in NDC
    const nearCornerResult = transformVec4(corners[0], orthoMatrix)
    expect(nearCornerResult.x).toBeCloseTo(-1)
    expect(nearCornerResult.y).toBeCloseTo(-1)
    expect(nearCornerResult.z).toBeCloseTo(-1)

    // Far top right should map to (1, 1, 1) in NDC
    const farCornerResult = transformVec4(corners[1], orthoMatrix)
    expect(farCornerResult.x).toBeCloseTo(1)
    expect(farCornerResult.y).toBeCloseTo(1)
    expect(farCornerResult.z).toBeCloseTo(1)
  })

  it('throws an error for invalid parameters', () => {
    // Valid parameters for reference
    const validLeft = -10
    const validRight = 10
    const validBottom = -10
    const validTop = 10
    const validNear = 0.1
    const validFar = 100

    // Test with left = right
    expect(() =>
      createOrthographicMatrix(
        validLeft,
        validLeft,
        validBottom,
        validTop,
        validNear,
        validFar,
      ),
    ).toThrow()

    // Test with bottom = top
    expect(() =>
      createOrthographicMatrix(
        validLeft,
        validRight,
        validBottom,
        validBottom,
        validNear,
        validFar,
      ),
    ).toThrow()

    // Test with near = far
    expect(() =>
      createOrthographicMatrix(
        validLeft,
        validRight,
        validBottom,
        validTop,
        validNear,
        validNear,
      ),
    ).toThrow()
  })
})

describe('createViewMatrix', () => {
  it('creates identity matrix when looking down negative z-axis from origin', () => {
    // Looking down the negative z-axis from the origin with y-up orientation
    // should produce something close to the identity matrix
    const eye = { x: 0, y: 0, z: 0 }
    const target = { x: 0, y: 0, z: -1 }
    const up = { x: 0, y: 1, z: 0 }

    const viewMatrix = createViewMatrix(eye, target, up)

    // The resulting matrix should be close to identity (ignoring precision issues)
    viewMatrix.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('correctly transforms points from world to view space', () => {
    // Camera position at (0, 0, 5) looking at the origin
    const eye = { x: 0, y: 0, z: 5 }
    const target = { x: 0, y: 0, z: 0 }
    const up = { x: 0, y: 1, z: 0 }

    const viewMatrix = createViewMatrix(eye, target, up)

    // Test points in world space
    const worldPoints = [
      { x: 0, y: 0, z: 0, w: 1 }, // Origin (target)
      { x: 0, y: 0, z: 5, w: 1 }, // Camera position
      { x: 1, y: 0, z: 0, w: 1 }, // Point to the right of origin
      { x: 0, y: 1, z: 0, w: 1 }, // Point above origin
    ]

    // Origin should transform to (0, 0, -5) in view space
    // (5 units in front of the camera)
    const originTransformed = transformVec4(worldPoints[0], viewMatrix)
    expect(originTransformed.x).toBeCloseTo(0)
    expect(originTransformed.y).toBeCloseTo(0)
    expect(originTransformed.z).toBeCloseTo(-5)

    // Camera position should transform to (0, 0, 0) in view space
    const eyeTransformed = transformVec4(worldPoints[1], viewMatrix)
    expect(eyeTransformed.x).toBeCloseTo(0)
    expect(eyeTransformed.y).toBeCloseTo(0)
    expect(eyeTransformed.z).toBeCloseTo(0)

    // Point to the right should be on positive x-axis in view space
    const rightTransformed = transformVec4(worldPoints[2], viewMatrix)
    expect(rightTransformed.x).toBeCloseTo(1)
    expect(rightTransformed.y).toBeCloseTo(0)
    expect(rightTransformed.z).toBeCloseTo(-5)

    // Point above should be on positive y-axis in view space
    const upTransformed = transformVec4(worldPoints[3], viewMatrix)
    expect(upTransformed.x).toBeCloseTo(0)
    expect(upTransformed.y).toBeCloseTo(1)
    expect(upTransformed.z).toBeCloseTo(-5)
  })

  it('handles a complex camera position and orientation', () => {
    // Camera positioned at a specific point looking at an angle
    const eye = { x: 10, y: 5, z: 10 }
    const target = { x: 0, y: 0, z: 0 }
    const up = { x: 0, y: 1, z: 0 }

    const viewMatrix = createViewMatrix(eye, target, up)

    // The target should be in front of the camera after transformation
    const targetTransformed = transformVec4(
      { x: 0, y: 0, z: 0, w: 1 },
      viewMatrix,
    )

    // In view space, negative z is forward
    expect(targetTransformed.z).toBeLessThan(0)

    // The camera position should be at the origin in view space
    const eyeTransformed = transformVec4(
      { x: 10, y: 5, z: 10, w: 1 },
      viewMatrix,
    )
    expect(eyeTransformed.x).toBeCloseTo(0)
    expect(eyeTransformed.y).toBeCloseTo(0)
    expect(eyeTransformed.z).toBeCloseTo(0)
  })

  it('throws an error for invalid inputs', () => {
    // Valid inputs for reference
    const validEye = { x: 0, y: 0, z: 5 }
    const validTarget = { x: 0, y: 0, z: 0 }
    const validUp = { x: 0, y: 1, z: 0 }

    // Test with eye same as target
    expect(() => createViewMatrix(validEye, validEye, validUp)).toThrow()

    // Test with zero up vector
    expect(() =>
      createViewMatrix(validEye, validTarget, { x: 0, y: 0, z: 0 }),
    ).toThrow()
  })
})

describe('createAxisAngleRotationMatrix', () => {
  it('creates identity matrix when angle is 0', () => {
    const axis = { x: 0, y: 1, z: 0 }
    const angle = 0

    const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)

    // Should match identity matrix
    rotationMatrix.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('creates correct matrix for rotation around x-axis', () => {
    const axis = { x: 1, y: 0, z: 0 }
    const angle = Math.PI / 2 // 90 degrees

    const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)

    // Should match x-axis rotation matrix
    const expected = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1]

    rotationMatrix.forEach((value, index) => {
      expect(value).toBeCloseTo(expected[index])
    })
  })

  it('creates correct matrix for rotation around y-axis', () => {
    const axis = { x: 0, y: 1, z: 0 }
    const angle = Math.PI / 2 // 90 degrees

    const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)

    // Should match y-axis rotation matrix
    const expected = [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]

    rotationMatrix.forEach((value, index) => {
      expect(value).toBeCloseTo(expected[index])
    })
  })

  it('creates correct matrix for rotation around z-axis', () => {
    const axis = { x: 0, y: 0, z: 1 }
    const angle = Math.PI / 2 // 90 degrees

    const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)

    // Should match z-axis rotation matrix
    const expected = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

    rotationMatrix.forEach((value, index) => {
      expect(value).toBeCloseTo(expected[index])
    })
  })

  it('rotates vectors correctly with an arbitrary axis', () => {
    // Rotation around the diagonal axis [1,1,1]
    const axis = { x: 1, y: 1, z: 1 }
    const angle = Math.PI / 3 // 60 degrees

    const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)

    // Test point
    const point = { x: 1, y: 0, z: 0, w: 1 }

    // Apply rotation
    const rotatedPoint = transformVec4(point, rotationMatrix)

    // After rotation, the point should be moved but maintain distance from origin
    const distance = Math.sqrt(
      rotatedPoint.x * rotatedPoint.x +
        rotatedPoint.y * rotatedPoint.y +
        rotatedPoint.z * rotatedPoint.z,
    )

    expect(distance).toBeCloseTo(1) // Should maintain unit distance

    // Ensure the point has moved from its original position
    expect(rotatedPoint.x).not.toBeCloseTo(point.x)
    expect(rotatedPoint.y).not.toBeCloseTo(point.y)
    expect(rotatedPoint.z).not.toBeCloseTo(point.z)
  })
})

describe('rotateAxisAngle', () => {
  it('applies axis-angle rotation to a matrix', () => {
    // Start with a translation matrix
    const translationMatrix = [
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1,
    ] as Mat4

    // Rotate around the y-axis by 90 degrees
    const axis = { x: 0, y: 1, z: 0 }
    const angle = Math.PI / 2

    const result = rotateAxisAngle(translationMatrix, axis, angle)

    // Using the right multiplication (m * r), the translation component
    // is not affected by the rotation - only the orientation changes
    expect(result[12]).toBeCloseTo(10) // Translation x doesn't change
    expect(result[13]).toBeCloseTo(20) // Translation y doesn't change
    expect(result[14]).toBeCloseTo(30) // Translation z doesn't change

    // The rotation part would have changed
    expect(result[0]).toBeCloseTo(0) // cos(90°) = 0
    expect(result[2]).toBeCloseTo(-1) // -sin(90°) = -1
    expect(result[8]).toBeCloseTo(1) // sin(90°) = 1
  })

  it('preserves identity matrix when angle is 0', () => {
    const axis = { x: 1, y: 1, z: 1 }
    const angle = 0

    const result = rotateAxisAngle(identity, axis, angle)

    // Should still be identity
    result.forEach((value, index) => {
      expect(value).toBeCloseTo(identity[index])
    })
  })

  it('composes with multiple rotations correctly', () => {
    let matrix = identity

    // Apply a sequence of rotations
    // First around x
    matrix = rotateAxisAngle(matrix, { x: 1, y: 0, z: 0 }, Math.PI / 4)

    // Then around y
    matrix = rotateAxisAngle(matrix, { x: 0, y: 1, z: 0 }, Math.PI / 4)

    // Then around z
    matrix = rotateAxisAngle(matrix, { x: 0, y: 0, z: 1 }, Math.PI / 4)

    // The result should be different from the identity matrix
    expect(matrix).not.toEqual(identity)

    // Test point
    const point = { x: 1, y: 0, z: 0, w: 1 }

    // Apply the combined rotations
    const rotatedPoint = transformVec4(point, matrix)

    // Should maintain distance from origin
    const distance = Math.sqrt(
      rotatedPoint.x * rotatedPoint.x +
        rotatedPoint.y * rotatedPoint.y +
        rotatedPoint.z * rotatedPoint.z,
    )

    expect(distance).toBeCloseTo(1)
  })
})

describe('axisAngleToQuaternion', () => {
  it('creates the identity quaternion when angle is 0', () => {
    const axis = { x: 1, y: 0, z: 0 }
    const angle = 0

    const quaternion = axisAngleToQuaternion(axis, angle)

    // Identity quaternion is [0, 0, 0, 1]
    expect(quaternion[0]).toBeCloseTo(0)
    expect(quaternion[1]).toBeCloseTo(0)
    expect(quaternion[2]).toBeCloseTo(0)
    expect(quaternion[3]).toBeCloseTo(1)
  })

  it('creates correct quaternion for 90-degree x-axis rotation', () => {
    const axis = { x: 1, y: 0, z: 0 }
    const angle = Math.PI / 2

    const quaternion = axisAngleToQuaternion(axis, angle)

    // For 90° around x-axis: [sin(45°), 0, 0, cos(45°)]
    const halfSqrt2 = Math.sqrt(2) / 2
    expect(quaternion[0]).toBeCloseTo(halfSqrt2)
    expect(quaternion[1]).toBeCloseTo(0)
    expect(quaternion[2]).toBeCloseTo(0)
    expect(quaternion[3]).toBeCloseTo(halfSqrt2)
  })

  it('handles non-normalized axis vectors', () => {
    // Non-normalized axis
    const axis = { x: 2, y: 0, z: 0 }
    const angle = Math.PI / 2

    const quaternion = axisAngleToQuaternion(axis, angle)

    // Should normalize the axis automatically
    const halfSqrt2 = Math.sqrt(2) / 2
    expect(quaternion[0]).toBeCloseTo(halfSqrt2)
    expect(quaternion[1]).toBeCloseTo(0)
    expect(quaternion[2]).toBeCloseTo(0)
    expect(quaternion[3]).toBeCloseTo(halfSqrt2)
  })
})
