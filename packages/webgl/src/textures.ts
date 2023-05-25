import type { TypedArray } from '@geomm/api'
import { isPowerOf2 } from '@geomm/maths'
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

  /* if (data !== null) */ updateTexture(gl, ret)

  return ret
}

export const updateTexture = (gl: WGL2RC, opts: TextureOptsOut) => {
  const { texture, internalFormat, format, type } = opts
  let { width, height, data } = opts
  const level = 0
  const border = 0
  const pixel = [0, 0, 255, 255]
  width = width || 1
  height = height || 1
  data =
    data ||
    new Uint8ClampedArray(
      Array.from({ length: width * height }, () => pixel).flat(),
    )
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    gl[internalFormat] as GLenum,
    width,
    height,
    border,
    gl[format] as GLenum,
    gl[type] as GLenum,
    data,
  )

  if (typeof data === 'string') {
    const image = new Image()
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        gl[internalFormat] as GLenum,
        gl[format] as GLenum,
        gl[type] as GLenum,
        image,
      )

      // WebGL1 has different requirements for power of 2 images
      // vs. non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D)
      } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      }
    }
    image.src = data
  }

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
