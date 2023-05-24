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

export interface AttributeInfo {
  name: string
  numComponents: number
  size: number
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

export interface MeshBufferGroup {
  buffers: BufferInfo[]
  indices?: TypedArray
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
  bufferGroup: MeshBufferGroup
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
