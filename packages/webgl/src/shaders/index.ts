import type { WGL2RC } from '../api'

export const loadShader = (
  gl: WGL2RC,
  type: number,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(type) as WebGLShader
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  /* if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      'An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader),
    )
    gl.deleteShader(shader)
    return null
  } */
  return shader
}

export const shaderProgram = (
  gl: WGL2RC,
  vsSource: string,
  fsSource: string,
  tfVaryings: string[] | null = null,
): WebGLProgram => {
  const shaderProgram = gl.createProgram() as WebGLShader
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)

  if (tfVaryings) {
    gl.transformFeedbackVaryings(
      shaderProgram,
      tfVaryings,
      gl.INTERLEAVED_ATTRIBS,
    )
  }

  gl.linkProgram(shaderProgram)

  /* if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      'Unable to initialize the shader program: ' +
        gl.getProgramInfoLog(shaderProgram),
    )
    return null
  } */

  return shaderProgram
}
