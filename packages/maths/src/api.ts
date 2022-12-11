import type { NumericArray } from '@geomm/api'
import type { vec3 } from 'gl-matrix'

export interface TransformationBlock {
  translation: vec3 | NumericArray
  rotation: {
    angle: number
    axis: vec3 | NumericArray
  }
  scale: vec3 | NumericArray
}
