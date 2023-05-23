import type { StringMap, TypedArray } from '@geomm/api'

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

export type Setters = StringMap<(val: unknown) => void>

export interface IndicesBuffer {
  data: TypedArray
  buffer: WebGLBuffer
  target: GLenum
  usage: GLenum
}

export interface BufferInfo {
  data: TypedArray
  /* debug?: string */
  buffer: WebGLBuffer
  target: GLenum
  usage: GLenum
  /* numComponents: number */
  /* size: number */
  /* name: string */
  type: GLenum
  attributes: AttributeBuffer[]
  /* location: GLenum */
  /* stride: number */
  /* offset: number */
}

export interface AttributeInfo {
  name: string
  numComponents: number
  size: number
  stride?: number
  offset?: number
  type?: GLenum
}

export interface AttributeBuffer extends AttributeInfo {
  location: number
  stride: number
  offset: number
  type: GLenum
}

export type Attributes = { [key: string]: BufferInfo }

/* FIXME: wtf are Primitives? This naming convention is terrible */
export interface PrimitiveRaw {
  data: TypedArray
  usage?: GLenum
  buffer?: WebGLBuffer
  attributes: AttributeInfo[]
}

export interface PrimitiveData {
  buffers: PrimitiveRaw[]
  indices: TypedArray /* TODO: This is optional */
}

export interface PrimitiveBuffer {
  bufferInfo: BufferInfo[]
  indices?: IndicesBuffer
}

/* TODO: Progam props, what is required here? What can be inferred? */
export interface Program {
  vao: WebGLVertexArrayObject
  program: WebGLProgram
  uniforms: StringMap<unknown>
  setters: Setters
  viewport: number[]
  fbo?: WebGLFramebuffer | null
  resolution?: { x: number; y: number } | null
}

export interface ProgramInfo {
  vertShader: string
  fragShader: string
  transformFeedbackVaryings?: string[]
}

export interface VAOProgramInfo extends ProgramInfo {
  bufferFn: (
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
  ) => PrimitiveBuffer
}

export interface TextureOpts {
  name: string
  width?: number
  height?: number
  type: keyof WGL2RC
  internalFormat: keyof WGL2RC
  format: keyof WGL2RC
  unit?: number
  filter?: keyof WGL2RC
  wrap?: keyof WGL2RC
  data?: any
}

export interface TextureOptsOut extends TextureOpts {
  texture: WebGLTexture
  unit: number
}

export interface TextureOptsMap extends TextureOptsOut {
  width: number
  height: number
}
