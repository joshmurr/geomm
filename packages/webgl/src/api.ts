import type { TypedArray } from '@geomm/api'

export type WGL2RC = WebGL2RenderingContext

export type WGL2Canvas = [HTMLCanvasElement, WGL2RC]

export type UBOUniformInfo = {
  [key: string]: { index: number; offset: number }
}

export type UBODesc = {
  uniforms: string[]
  info: UBOUniformInfo
  buffer: WebGLBuffer
}

export type SetterFn<T extends unknown[]> = (
  /* loc: WebGLUniformLocation, */
  ...args: T
) => void

export interface Setter {
  /* location: WebGLUniformLocation | number */
  constant: string
  fn: SetterFn<any>
}

export type Setters = {
  [key: string]: Setter
}

export interface IndicesBuffer {
  data: TypedArray
  buffer: WebGLBuffer
  target: GLenum
  usage: GLenum
}

export interface BufferInfo {
  data: TypedArray
  buffer: WebGLBuffer
  target: GLenum
  usage: GLenum
  numComponents: number
  size: number
  name: string
  type: GLenum
  location: GLenum
  stride: number
}

export type Attributes = { [key: string]: BufferInfo }

export interface PrimitiveRaw {
  name: string
  data: TypedArray
  numComponents: number
  size: number
}

export interface PrimitiveData {
  attributes: PrimitiveRaw[]
  indices: TypedArray /* TODO: This is optional */
}

export interface PrimitiveBuffer {
  attributes: BufferInfo[]
  indices: IndicesBuffer
}
