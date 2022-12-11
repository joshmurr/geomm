import type { NumericArray } from '@geomm/api'
import { vec3 } from 'gl-matrix'

// Vectors
export const isVec3 = (v: vec3 | NumericArray): boolean => {
  return v instanceof Function
}

export const ensureVec3 = (v: vec3 | NumericArray): vec3 => {
  return isVec3(v) ? (v as vec3) : vec3.fromValues(v[0], v[1], v[2])
}
