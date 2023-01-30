import { cube, quad, icosahedron } from '@geomm/geometry'
import type { PrimitiveBuffer } from './api'
import { createBufferInfoForProgram } from './buffers'

export const quadBuffer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): PrimitiveBuffer => {
  return createBufferInfoForProgram(gl, quad, program)
}

export const cubeBuffer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): PrimitiveBuffer => {
  return createBufferInfoForProgram(gl, cube, program)
}

export const icosahedronBuffer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): PrimitiveBuffer => {
  return createBufferInfoForProgram(gl, icosahedron, program)
}
