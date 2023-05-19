import type { Program, ProgramInfo, WGL2RC } from './api'
import { createVAO } from './buffers'
import { shaderProgram } from './shaders'
import { getUniformSetters, setUniforms } from './uniforms'

export const simpleRender = (
  gl: WGL2RC,
  loop: boolean,
  programs: Program[],
) => {
  programs.forEach(({ vao, program, fbo, uniforms, setters, resolution }) => {
    const draw = (time: number) => {
      gl.useProgram(program)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo || null)

      gl.bindVertexArray(vao)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.clearColor(0.9, 0.9, 0.9, 1)

      gl.viewport(
        0,
        0,
        resolution?.x || gl.canvas.width,
        resolution?.y || gl.canvas.height,
      )

      setUniforms(setters, {
        u_Time: time,
        ...uniforms,
      })

      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      if (loop) requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  })
}

export const initProgram = (
  gl: WGL2RC,
  { vertShader, fragShader, bufferFn }: ProgramInfo,
) => {
  const program = shaderProgram(gl, vertShader, fragShader)
  const buffer = bufferFn(gl, program)
  const vao = createVAO(gl, buffer)
  const uniformSetters = getUniformSetters(gl, program)

  return { program, vao, setters: uniformSetters }
}

export const pingPong = (
  gl: WGL2RC,
  computePrograms: Program[],
  renderProgram: Program,
  loop: boolean,
  delay = 0,
) => {
  const draw = () => {
    computePrograms.forEach(
      ({ program, setters, uniforms, vao, viewport, fbo }) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo || null)
        gl.bindVertexArray(vao)
        gl.useProgram(program)
        setUniforms(setters, uniforms)

        gl.viewport(0, 0, viewport[0], viewport[1])
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      },
    )

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindVertexArray(renderProgram.vao)
    gl.useProgram(renderProgram.program)
    setUniforms(renderProgram.setters, renderProgram.uniforms)
    gl.viewport(0, 0, renderProgram.viewport[0], renderProgram.viewport[1])
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

    if (loop) {
      if (delay > 0) setTimeout(() => requestAnimationFrame(draw), delay)
      else requestAnimationFrame(draw)
    }
  }
  requestAnimationFrame(draw)
}
