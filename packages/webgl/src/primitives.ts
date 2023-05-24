import { cube, quad, icosahedron } from '@geomm/geometry'
import type { BufferInfoComputed } from './api'
import { createBufferInfo } from './buffers'

export const quadBuffer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): BufferInfoComputed[] => {
  return quad.buffers.map((bufInfo) => createBufferInfo(gl, bufInfo, program))
}

export const cubeBuffer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): BufferInfoComputed[] => {
  return cube.buffers.map((bufInfo) => createBufferInfo(gl, bufInfo, program))
}

export const icosahedronBuffer = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
): BufferInfoComputed[] => {
  return icosahedron.buffers.map((bufInfo) =>
    createBufferInfo(gl, bufInfo, program),
  )
}
