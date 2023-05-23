import type { ProgramInfo, WGL2RC } from '../api'

export const loadShader = (
  gl: WGL2RC,
  type: number,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(type) as WebGLShader
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  return shader
}

export const shaderProgram = (
  gl: WGL2RC,
  { vertShader, fragShader, transformFeedbackVaryings }: ProgramInfo,
): WebGLProgram => {
  const program = gl.createProgram() as WebGLShader
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertShader)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragShader)

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)

  if (transformFeedbackVaryings) {
    gl.transformFeedbackVaryings(
      program,
      transformFeedbackVaryings,
      gl.INTERLEAVED_ATTRIBS,
    )
  }

  gl.linkProgram(program)

  return program
}

export * from './templates'
