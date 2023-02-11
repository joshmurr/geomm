import type { WGL2RC } from './api'

export const createFramebuffer = (gl: WGL2RC, target: WebGLTexture) => {
  gl.bindTexture(gl.TEXTURE_2D, null)
  const fb = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    target,
    0,
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return fb
}
