import type { VAOProgramInfo, WGL2RC } from './api'
import { createBufferInfo, createVAO } from './buffers'
import { shaderProgram } from './shaders'
import { getUniformSetters } from './uniforms'

export const initProgram = (
  gl: WGL2RC,
  { vertShader, fragShader, bufferGroup }: VAOProgramInfo,
) => {
  const program = shaderProgram(gl, { vertShader, fragShader })
  const { buffers, indices } = bufferGroup
  const bufferInfos = buffers.map((buf) => createBufferInfo(gl, buf, program))
  const vao = createVAO(gl, bufferInfos, indices)
  const uniformSetters = getUniformSetters(gl, program)

  gl.useProgram(program)
  gl.bindVertexArray(vao)

  return { program, vao, setters: uniformSetters }
}
