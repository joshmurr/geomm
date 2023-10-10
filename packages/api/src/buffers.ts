import { TypedArray } from './arrays'

export interface BufferData {
  buffer: WebGLBuffer
  target: GLenum
  usage: GLenum
  data: TypedArray | null
}

export interface BufferInfoComputed extends BufferData {
  type: GLenum
  attributes: AttributeInfoComputed[]
  indices?: TypedArray
}

export interface AttributeInfo {
  name: string
  numComponents: number
  stride?: number
  offset?: number
  type?: GLenum
}

export interface AttributeInfoComputed extends AttributeInfo {
  location: number
  stride: number
  offset: number
  type: GLenum
}

export interface BufferInfo {
  data?: TypedArray | null
  buffer?: WebGLBuffer
  target?: GLenum
  usage?: GLenum
  type?: GLenum
  attributes: AttributeInfo[]
}
export interface MeshBufferGroup {
  buffers: BufferInfo[]
  indices?: TypedArray
}
