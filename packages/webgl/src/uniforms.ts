import type { StringMap } from '@geomm/api'
import type { WGL2RC } from './api'
import { setters } from './setters'

export const numUniforms = (gl: WGL2RC, program: WebGLProgram): number => {
  return gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
}

export const getActiveUniform = (
  gl: WGL2RC,
  program: WebGLProgram,
  index: number,
): WebGLActiveInfo => {
  const uniformInfo = gl.getActiveUniform(program, index) as WebGLActiveInfo
  return uniformInfo
}

export const uniformList = (gl: WGL2RC, program: WebGLProgram) => {
  const nUniforms = numUniforms(gl, program)

  return [...new Array(nUniforms)].map((_, i) =>
    getActiveUniform(gl, program, i),
  )
}

export const getSetter = (
  gl: WGL2RC,
  program: WebGLProgram,
  uniformInfo: WebGLActiveInfo,
) => {
  const location = gl.getUniformLocation(
    program,
    uniformInfo.name,
  ) as WebGLUniformLocation
  return setters(gl, uniformInfo.type, location).fn
}

export const getUniformSetters = (gl: WGL2RC, program: WebGLProgram) => {
  return uniformList(gl, program).reduce(
    (setters, u) => ({
      ...setters,
      [u.name]: getSetter(gl, program, u),
    }),
    {},
  )
}

export const setUniforms = (
  setters: StringMap<(val: unknown, name?: string) => void>,
  uniforms: StringMap<unknown>,
) => {
  for (const [name, value] of Object.entries(uniforms)) {
    if (!setters[name]) continue // Uniform was not found in shader
    setters[name](value)
  }
}

/* export const setUBO = ( */
/*   gl: WGL2RC, */
/*   uboDesc: UBODesc, */
/*   variableGetter: (i: number) => Float32Array, */
/* ) => { */
/*   gl.bindBuffer(gl.UNIFORM_BUFFER, uboDesc.buffer) */
/*   uboDesc.uniforms.forEach((name, i) => { */
/*     gl.bufferSubData( */
/*       gl.UNIFORM_BUFFER, */
/*       uboDesc.info[name].offset, */
/*       variableGetter(i), */
/*       0, */
/*     ) */
/*   }) */
/*   gl.bindBuffer(gl.UNIFORM_BUFFER, null) */
/* } */
