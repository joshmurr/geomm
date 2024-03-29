import type { Program, Viewport, WGL2RC } from './api'
import { setUniforms } from './uniforms'

const setViewport = (gl: WGL2RC, viewport: Viewport) => {
  if (Array.isArray(viewport)) {
    if (viewport.length === 2) return gl.viewport(0, 0, ...viewport)
    return gl.viewport(...viewport)
  }
  if (viewport) return gl.viewport(0, 0, viewport.x, viewport.y)
  return gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}

export const simpleRender = (
  gl: WGL2RC,
  loop: boolean,
  programs: Program[],
) => {
  programs.forEach(({ vao, program, fbo, uniforms, setters, viewport }) => {
    const draw = (time: number) => {
      gl.useProgram(program)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo || null)

      gl.bindVertexArray(vao)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.clearColor(0.9, 0.9, 0.9, 1)

      setViewport(gl, viewport)

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

        setViewport(gl, viewport)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      },
    )

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.bindVertexArray(renderProgram.vao)
    gl.useProgram(renderProgram.program)
    setUniforms(renderProgram.setters, renderProgram.uniforms)
    setViewport(gl, renderProgram.viewport)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

    if (loop) {
      if (delay > 0) setTimeout(() => requestAnimationFrame(draw), delay)
      else requestAnimationFrame(draw)
    }
  }
  requestAnimationFrame(draw)
}
