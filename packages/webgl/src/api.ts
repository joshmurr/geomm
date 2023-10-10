import type { MeshBufferGroup, StringMap, Vec } from '@geomm/api'

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

export type Viewport =
  | [number, number, number, number]
  | [number, number]
  | Vec
  | null
  | undefined

/* TODO: Progam props, what is required here? What can be inferred? */
export interface Program {
  vao: WebGLVertexArrayObject
  program: WebGLProgram
  uniforms: StringMap<unknown>
  setters: Setters
  viewport?: Viewport
  fbo?: WebGLFramebuffer | null
  /* resolution?: { x: number; y: number } | null */
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
