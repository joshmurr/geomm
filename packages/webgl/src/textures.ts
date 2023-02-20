import type { TypedArray } from '@geomm/api'
import type { TextureOpts, TextureOptsOut, WGL2RC } from './api'

export const textureUnitMap: string[] = []

export const createTexture = (
  gl: WGL2RC,
  { name, width, height, filter, wrap, data, ...rest }: TextureOpts,
) => {
  const texture = gl.createTexture()

  if (texture === null) throw Error('Error creating texture.')

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MAG_FILTER,
    gl[filter || 'NEAREST'] as GLenum,
  )
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl[filter || 'NEAREST'] as GLenum,
  )
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    gl[wrap || 'CLAMP_TO_EDGE'] as GLenum,
  )
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    gl[wrap || 'CLAMP_TO_EDGE'] as GLenum,
  )

  textureUnitMap.push(name)

  const ret: TextureOptsOut = {
    name,
    unit: textureUnitMap.indexOf(name),
    width,
    height,
    filter,
    wrap,
    data,
    texture,
    ...rest,
  }

  if (data !== null) updateTexture(gl, ret)

  return ret
}

export const updateTexture = (gl: WGL2RC, opts: TextureOptsOut) => {
  const { texture, width, height, type, format, data } = opts
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl[type] as GLenum,
    width || 1,
    height || 1,
    0,
    gl[format] as GLenum,
    gl.UNSIGNED_BYTE,
    data || null,
  )
  console.log(opts)
  return opts
}

export const textureLoader = (gl: WGL2RC) => {
  const genericTextureLoader = (
    w: number,
    h: number,
    type: keyof WGL2RC,
    format: keyof WGL2RC,
    name: string,
  ) => {
    /* INFO: Unfortunately this just didn't work out */

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    textureUnitMap.push(name)
    return (data: TypedArray | null) => {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl[type] as GLenum,
        w,
        h,
        0,
        gl[format] as GLenum,
        gl.UNSIGNED_BYTE,
        data,
      )
      return texture
    }
  }
  return genericTextureLoader
}

export const textureMap = {
  R8: (
    gl: WGL2RC,
    w: number,
    h: number,
    data: Uint8Array | Float32Array,
  ): void =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8,
      w,
      h,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      data,
    ),
  RGB: (
    gl: WGL2RC,
    w: number,
    h: number,
    data: Uint8Array | Float32Array,
  ): void =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB8,
      w,
      h,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      data,
    ),
  RGBA: (
    gl: WGL2RC,
    w: number,
    h: number,
    data: Uint8Array | Float32Array,
  ): void =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      w,
      h,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    ),
  RGBA16F: (
    gl: WGL2RC,
    w: number,
    h: number,
    data: Float32Array | null,
  ): void =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      w,
      h,
      0,
      gl.RGBA,
      gl.FLOAT,
      data,
    ),
  R32F: (gl: WGL2RC, w: number, h: number, data: Float32Array | null): void =>
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, data),
  RGBA32F: (
    gl: WGL2RC,
    w: number,
    h: number,
    data: Float32Array | null,
  ): void =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      w,
      h,
      0,
      gl.RGBA,
      gl.FLOAT,
      data,
    ),
  LUMINANCE: (
    gl: WGL2RC,
    w: number,
    h: number,
    data: Float32Array | null,
  ): void =>
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.LUMINANCE,
      w,
      h,
      0,
      gl.LUMINANCE,
      gl.UNSIGNED_BYTE,
      data,
    ),
}
