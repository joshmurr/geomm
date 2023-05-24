import type { TypedArray } from '@geomm/api'
import type {
  AttributeInfoComputed,
  BufferData,
  BufferInfo,
  BufferInfoComputed,
  WGL2RC,
} from './api'

export const bindBuffer = (
  gl: WebGL2RenderingContext,
  bufferInfo: BufferInfoComputed,
) => {
  const { buffer, target } = bufferInfo
  gl.bindBuffer(target, buffer)
}

export const bindBufferData = (
  gl: WebGL2RenderingContext,
  bufferInfo: BufferData,
) => {
  const { buffer, data, target, usage } = bufferInfo
  gl.bindBuffer(target, buffer)
  gl.bufferData(target, data, usage)
  return buffer
}

export const unbindAll = (gl: WebGL2RenderingContext): void => {
  gl.bindVertexArray(null)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

export const attributeFound = (attribBuf: AttributeInfoComputed) => {
  const found = attribBuf.location >= 0
  if (!found) console.warn(`Cannot find ${attribBuf.name} in program.`)
  return found
}

export const setupVertexAttrib = (
  gl: WebGL2RenderingContext,
  attrib: AttributeInfoComputed,
) => {
  gl.enableVertexAttribArray(attrib.location)
  gl.vertexAttribPointer(
    attrib.location,
    attrib.numComponents,
    attrib.type,
    false, // normalize
    attrib.stride,
    attrib.offset,
  )
}

export const createVAO = (
  gl: WebGL2RenderingContext,
  buffers: BufferInfoComputed[],
  indices?: TypedArray,
): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray() as WebGLVertexArrayObject
  gl.bindVertexArray(vao)

  for (const bufferInfo of buffers) {
    const { attributes } = bufferInfo
    bindBufferData(gl, bufferInfo)
    for (const attribInfo of attributes) {
      if (!attributeFound(attribInfo)) continue
      setupVertexAttrib(gl, attribInfo)
    }
  }
  if (indices) {
    bindBufferData(gl, {
      data: indices,
      target: gl.ELEMENT_ARRAY_BUFFER,
      usage: gl.STATIC_DRAW,
      buffer: gl.createBuffer() as WebGLBuffer,
    })
  }

  unbindAll(gl)
  return vao
}

export const createBufferInfo = (
  gl: WGL2RC,
  bufferInfo: BufferInfo,
  program: WebGLProgram,
): BufferInfoComputed => ({
  data: bufferInfo?.data ?? null,
  target: bufferInfo?.target ?? gl.ARRAY_BUFFER,
  usage: bufferInfo?.usage ?? gl.STATIC_DRAW,
  buffer: bufferInfo?.buffer ?? (gl.createBuffer() as WebGLBuffer),
  type: bufferInfo?.type ?? gl.FLOAT,

  attributes: bufferInfo.attributes.map((attributeInfo) => ({
    ...attributeInfo,
    type: attributeInfo.type ?? gl.FLOAT,
    stride: attributeInfo.stride ?? 0,
    offset: attributeInfo.offset ?? 0,
    location: gl.getAttribLocation(program, attributeInfo.name),
  })),
})
