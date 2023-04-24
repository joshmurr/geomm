import type { TypedArray } from '@geomm/api'
import type { TextureOpts, TextureOptsOut, WGL2RC } from './api'

export const textureUnitMap: string[] = []

export const createTexture = (
  gl: WGL2RC,
  {
    name,
    width,
    height,
    filter,
    wrap,
    format,
    internalFormat,
    type,
    data,
    ...rest
  }: TextureOpts,
) => {
  const texture = gl.createTexture()

  if (texture === null) throw Error('Error creating texture.')
  textureUnitMap.push(name)

  filter = filter || 'NEAREST'
  wrap = wrap || 'CLAMP_TO_EDGE'

  gl.bindTexture(gl.TEXTURE_2D, texture)
  /* gl.activeTexture(gl.TEXTURE0 + textureUnitMap.indexOf(name)) */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[filter] as GLenum)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[filter] as GLenum)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[wrap] as GLenum)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[wrap] as GLenum)

  const ret: TextureOptsOut = {
    name,
    unit: textureUnitMap.indexOf(name),
    width,
    height,
    filter,
    wrap,
    data,
    format,
    internalFormat,
    type,
    texture,
    ...rest,
  }

  if (data !== null) updateTexture(gl, ret)

  return ret
}

export const updateTexture = (gl: WGL2RC, opts: TextureOptsOut) => {
  const { texture, width, height, internalFormat, format, type, data } = opts
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl[internalFormat] as GLenum,
    width || 1,
    height || 1,
    0,
    gl[format] as GLenum,
    gl[type] as GLenum,
    data || null,
  )
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
