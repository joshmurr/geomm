import { Vec2 } from '@geomm/api'

export type VertexIds = { [key: number]: [number, number, number] }

export type CurveFn = (p: Vec2[], t: number) => Vec2

export type IndexedBuffer = {
  buffers: {
    data: Float32Array
    attributes: {
      name: string
      numComponents: number
      size: number
    }[]
  }[]
  indices: Uint16Array
}
