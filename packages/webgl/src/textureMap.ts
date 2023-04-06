import type { TextureOptsMap, WGL2RC } from './api'

export const textureMap = {
  R8: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8,
      width,
      height,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      data,
    ),
  RGB: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB8,
      width,
      height,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      data,
    ),
  RGBA: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    ),
  RGBA16F: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      width,
      height,
      0,
      gl.RGBA,
      gl.FLOAT,
      data,
    ),
  R32F: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      width,
      height,
      0,
      gl.RED,
      gl.FLOAT,
      data,
    ),
  RGBA32F: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      width,
      height,
      0,
      gl.RGBA,
      gl.FLOAT,
      data,
    ),
  LUMINANCE: (gl: WGL2RC, { width, height, data }: TextureOptsMap) =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      width,
      height,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      data,
    ),
}
