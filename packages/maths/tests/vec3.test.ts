import { expect, describe, it } from 'vitest'
import {
  vec3,
  sub3,
  add3,
  mul3,
  scale3,
  div3,
  dot3,
  cross3,
  normalize3,
  mag3,
  distanceSq3,
  distance3,
  centroid3,
  centroid3Float,
} from '../src/vec3'

describe('vec3', () => {
  it('creates a vector with the provided components', () => {
    const v = vec3(1, 2, 3)
    expect(v).toEqual({ x: 1, y: 2, z: 3 })
  })
})

describe('sub3', () => {
  it('subtracts two vectors component-wise', () => {
    const a = vec3(5, 8, 10)
    const b = vec3(2, 3, 4)
    const result = sub3(a, b)
    expect(result).toEqual({ x: 3, y: 5, z: 6 })
  })

  it('handles zero values correctly', () => {
    const a = vec3(5, 5, 5)
    const b = vec3(0, 0, 0)
    expect(sub3(a, b)).toEqual({ x: 5, y: 5, z: 5 })
    expect(sub3(b, a)).toEqual({ x: -5, y: -5, z: -5 })
  })
})

describe('add3', () => {
  it('adds two vectors component-wise', () => {
    const a = vec3(1, 2, 3)
    const b = vec3(4, 5, 6)
    const result = add3(a, b)
    expect(result).toEqual({ x: 5, y: 7, z: 9 })
  })

  it('handles zero values correctly', () => {
    const a = vec3(5, 5, 5)
    const b = vec3(0, 0, 0)
    expect(add3(a, b)).toEqual({ x: 5, y: 5, z: 5 })
  })
})

describe('mul3', () => {
  it('multiplies two vectors component-wise', () => {
    const a = vec3(2, 3, 4)
    const b = vec3(3, 4, 5)
    const result = mul3(a, b)
    expect(result).toEqual({ x: 6, y: 12, z: 20 })
  })

  it('handles zero values correctly', () => {
    const a = vec3(5, 5, 5)
    const b = vec3(0, 0, 0)
    expect(mul3(a, b)).toEqual({ x: 0, y: 0, z: 0 })
  })
})

describe('scale3', () => {
  it('scales a vector by a scalar value', () => {
    const v = vec3(1, 2, 3)
    const result = scale3(v, 2)
    expect(result).toEqual({ x: 2, y: 4, z: 6 })
  })

  it('handles zero scalar correctly', () => {
    const v = vec3(5, 10, 15)
    expect(scale3(v, 0)).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('handles negative scalar correctly', () => {
    const v = vec3(1, 2, 3)
    expect(scale3(v, -1)).toEqual({ x: -1, y: -2, z: -3 })
  })
})

describe('div3', () => {
  it('divides two vectors component-wise', () => {
    const a = vec3(6, 8, 10)
    const b = vec3(2, 2, 5)
    const result = div3(a, b)
    expect(result).toEqual({ x: 3, y: 4, z: 2 })
  })

  it('handles division by small values', () => {
    const a = vec3(1, 2, 3)
    const b = vec3(0.5, 0.5, 0.5)
    expect(div3(a, b)).toEqual({ x: 2, y: 4, z: 6 })
  })
})

describe('dot3', () => {
  it('calculates the dot product of two vectors', () => {
    const a = vec3(1, 2, 3)
    const b = vec3(4, 5, 6)
    const result = dot3(a, b)
    expect(result).toBe(32) // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
  })

  it('returns 0 for perpendicular vectors', () => {
    const a = vec3(1, 0, 0)
    const b = vec3(0, 1, 0)
    expect(dot3(a, b)).toBe(0)
  })
})

describe('cross3', () => {
  it('calculates the cross product of two vectors', () => {
    const a = vec3(0, 1, 0)
    const b = vec3(0, 0, 1)
    const result = cross3(a, b)
    expect(result).toEqual({ x: 1, y: 0, z: 0 })
  })

  it('follows the right-hand rule', () => {
    const i = vec3(1, 0, 0)
    const j = vec3(0, 1, 0)
    const k = vec3(0, 0, 1)

    expect(cross3(i, j)).toEqual(k)
    expect(cross3(j, k)).toEqual(i)
    expect(cross3(k, i)).toEqual(j)
  })

  it('returns a vector perpendicular to both input vectors', () => {
    const a = vec3(2, 3, 4)
    const b = vec3(5, 6, 7)
    const result = cross3(a, b)

    // Verify perpendicularity
    expect(dot3(result, a)).toBeCloseTo(0)
    expect(dot3(result, b)).toBeCloseTo(0)
  })
})

describe('normalize3', () => {
  it('returns a unit vector with the same direction', () => {
    const v = vec3(3, 0, 0)
    const result = normalize3(v)
    expect(result).toEqual({ x: 1, y: 0, z: 0 })
  })

  it('returns a vector with magnitude 1', () => {
    const v = vec3(3, 4, 5)
    const result = normalize3(v)
    const magnitude = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2)
    expect(magnitude).toBeCloseTo(1, 10)
  })

  it('handles zero vectors correctly', () => {
    const v = vec3(0, 0, 0)
    const result = normalize3(v)
    expect(result).toEqual({ x: 0, y: 0, z: 0 })
  })
})

describe('mag3', () => {
  it('calculates the magnitude of a vector', () => {
    const v = vec3(3, 4, 0)
    const result = mag3(v)
    expect(result).toBe(5) // sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5
  })

  it('handles zero vectors correctly', () => {
    const v = vec3(0, 0, 0)
    expect(mag3(v)).toBe(0)
  })
})

describe('distanceSq3', () => {
  it('calculates the squared distance between two vectors', () => {
    const a = vec3(1, 2, 3)
    const b = vec3(4, 6, 8)
    const result = distanceSq3(a, b)
    expect(result).toBe(50) // (4-1)^2 + (6-2)^2 + (8-3)^2 = 9 + 16 + 25 = 50
  })

  it('returns 0 for identical points', () => {
    const a = vec3(5, 5, 5)
    expect(distanceSq3(a, a)).toBe(0)
  })
})

describe('distance3', () => {
  it('calculates the distance between two vectors', () => {
    const a = vec3(0, 0, 0)
    const b = vec3(3, 4, 0)
    const result = distance3(a, b)
    expect(result).toBe(5)
  })

  it('returns the same result as sqrt(distanceSq3)', () => {
    const a = vec3(1, 2, 3)
    const b = vec3(4, 6, 8)
    const result = distance3(a, b)
    expect(result).toBe(Math.sqrt(distanceSq3(a, b)))
  })
})

describe('centroid3', () => {
  it('calculates the centroid of three vectors', () => {
    const a = vec3(0, 0, 0)
    const b = vec3(3, 0, 0)
    const c = vec3(0, 3, 0)
    const result = centroid3(a, b, c)
    expect(result).toEqual({ x: 1, y: 1, z: 0 })
  })

  it('returns the input point when all three points are identical', () => {
    const p = vec3(5, 5, 5)
    expect(centroid3(p, p, p)).toEqual(p)
  })
})

describe('centroid3Float', () => {
  it('calculates the centroid of three Float32Array vectors', () => {
    const a = new Float32Array([0, 0, 0])
    const b = new Float32Array([3, 0, 0])
    const c = new Float32Array([0, 3, 0])
    const result = centroid3Float(a, b, c)

    expect(result instanceof Float32Array).toBe(true)
    expect(result[0]).toBe(1)
    expect(result[1]).toBe(1)
    expect(result[2]).toBe(0)
  })

  it('returns the input point when all three points are identical', () => {
    const p = new Float32Array([5, 5, 5])
    const result = centroid3Float(p, p, p)
    expect(result[0]).toBe(5)
    expect(result[1]).toBe(5)
    expect(result[2]).toBe(5)
  })
})
