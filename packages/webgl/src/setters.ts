import type { Setter, WGL2RC } from './api'

export const setters = (
  gl: WGL2RC,
  type: GLenum,
  loc: WebGLUniformLocation,
) => {
  const samplerSetter = (texture: WebGLTexture) => {
    /* const unit = this._textureUnitMap.indexOf(name) */
    gl.uniform1i(loc, 0)
    gl.activeTexture(gl.TEXTURE0 + 0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
  }

  const _setters: { [key: number]: Setter } = {
    0x1406: {
      constant: 'FLOAT',
      fn: (val: number[]) => gl.uniform1f(loc, val[0]),
    },
    0x8b50: {
      constant: 'FLOAT_VEC2',
      fn: (val: number[]) => gl.uniform2fv(loc, val),
    },
    0x8b51: {
      constant: 'FLOAT_VEC3',
      fn: (val: number[]) => gl.uniform3fv(loc, val),
    },
    0x8b52: {
      constant: 'FLOAT_VEC4',
      fn: (val: number[]) => gl.uniform4fv(loc, val),
    },
    0x8b5a: {
      constant: 'FLOAT_MAT2',
      fn: (val: number[]) => gl.uniformMatrix2fv(loc, false, val),
    },
    0x8b5b: {
      constant: 'FLOAT_MAT3',
      fn: (val: number[]) => gl.uniformMatrix3fv(loc, false, val),
    },
    0x8b5c: {
      constant: 'FLOAT_MAT4',
      fn: (val: number[]) => gl.uniformMatrix4fv(loc, false, val),
    },
    0x8b5e: {
      constant: 'SAMPLER_2D',
      fn: (texture: WebGLTexture) => samplerSetter(texture),
    },
  }
  return _setters[type]
}

/*
const typeMap = {
  0x1406: {
    constant: 'FLOAT',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number) =>
      gl.uniform1f(loc, val),
  },
  0x8b50: {
    constant: 'FLOAT_VEC2',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform2fv(loc, val),
  },
  0x8b51: {
    constant: 'FLOAT_VEC3',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform3fv(loc, val),
  },
  0x8b52: {
    constant: 'FLOAT_VEC4',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform4fv(loc, val),
  },
  0x1404: {
    constant: 'INT',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number) =>
      gl.uniform1i(loc, val),
  },
  0x8b53: {
    constant: 'INT_VEC2',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform2iv(loc, val),
  },
  0x8b54: {
    constant: 'INT_VEC3',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform3iv(loc, val),
  },
  0x8b55: {
    constant: 'INT_VEC4',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform4iv(loc, val),
  },
  0x8b56: {
    constant: 'BOOL',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number) =>
      gl.uniform1i(loc, val),
  },
  0x8b57: {
    constant: 'BOOL_VEC2',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform2iv(loc, val),
  },
  0x8b58: {
    constant: 'BOOL_VEC3',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform3iv(loc, val),
  },
  0x8b59: {
    constant: 'BOOL_VEC4',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniform4iv(loc, val),
  },
  0x8b5a: {
    constant: 'FLOAT_MAT2',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix2fv(loc, false, val),
  },
  0x8b5b: {
    constant: 'FLOAT_MAT3',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix3fv(loc, false, val),
  },
  0x8b5c: {
    constant: 'FLOAT_MAT4',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix4fv(loc, false, val),
  },
  0x8b5e: {
    constant: 'SAMPLER_2D',
    setterFn:
      (gl: WGL2RC) =>
      (loc: WebGLUniformLocation, texture: WebGLTexture, name: string) =>
        this.samplerSetter(gl, loc, texture, name),
  },
  0x8b60: { constant: 'SAMPLER_CUBE', setterFn: null },
  0x8b5f: { constant: 'SAMPLER_3D', setterFn: null },
  0x8b62: { constant: 'SAMPLER_2D_SHADOW', setterFn: null },
  0x8b65: {
    constant: 'FLOAT_MAT2x3',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix2x3fv(loc, false, val),
  },
  0x8b66: {
    constant: 'FLOAT_MAT2x4',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix2x4fv(loc, false, val),
  },
  0x8b67: {
    constant: 'FLOAT_MAT3x2',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix3x2fv(loc, false, val),
  },
  0x8b68: {
    constant: 'FLOAT_MAT3x4',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix3x4fv(loc, false, val),
  },
  0x8b69: {
    constant: 'FLOAT_MAT4x2',
    setterFn: (gl: WGL2RC) => (loc: WebGLUniformLocation, val: number[]) =>
      gl.uniformMatrix4x2fv(loc, false, val),
  },
  0x8b6a: {
    constant: 'FLOAT_MAT4x3',
    setterFn: (gl: WGL2RC, loc: WebGLUniformLocation) => (val: number[]) =>
      gl.uniformMatrix4x3fv(loc, false, val),
  },
} */

/* export const applyGeneric = (
  gl: WGL2RC,
  loc: WebGLUniformLocation,
  constant: number,
): ((v: number[]) => void) => {
  return typeMap[constant].setterFn(gl, loc)
} */
