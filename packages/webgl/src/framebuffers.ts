import type { TextureOptsOut, WGL2RC } from './api'

export const createFramebuffer = (gl: WGL2RC, { texture }: TextureOptsOut) => {
  gl.bindTexture(gl.TEXTURE_2D, null)
  const fb = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return fb
}
