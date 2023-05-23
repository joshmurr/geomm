import type { TypedArray } from '@geomm/api'
import type {
  AttributeBuffer,
  BufferInfo,
  IndicesBuffer,
  PrimitiveBuffer,
  PrimitiveData,
  PrimitiveRaw,
  WGL2RC,
} from './api'

export const bindBuffer = (
  gl: WebGL2RenderingContext,
  bufferInfo: BufferInfo,
) => {
  const { buffer, target } = bufferInfo
  gl.bindBuffer(target, buffer)
}

export const bindBufferData = (
  gl: WebGL2RenderingContext,
  bufferInfo: BufferInfo | IndicesBuffer,
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

export const attributeFound = (attribBuf: AttributeBuffer) => {
  const found = attribBuf.location >= 0
  if (!found) console.warn(`Cannot find ${attribBuf.name} in program.`)
  return found
}

export const setupVertexAttrib = (
  gl: WebGL2RenderingContext,
  attrib: AttributeBuffer,
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
  primitive: PrimitiveBuffer,
): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray() as WebGLVertexArrayObject
  gl.bindVertexArray(vao)

  for (const bufferInfo of primitive.bufferInfo) {
    bindBufferData(gl, bufferInfo)
    for (const attribInfo of bufferInfo.attributes) {
      if (!attributeFound(attribInfo)) continue
      setupVertexAttrib(gl, attribInfo)
    }
  }

  if (primitive?.indices) bindBufferData(gl, primitive.indices)

  unbindAll(gl)
  return vao
}

export const createIndicesInfo = (
  gl: WGL2RC,
  indices: TypedArray,
): IndicesBuffer => ({
  data: indices,
  target: gl.ELEMENT_ARRAY_BUFFER,
  usage: gl.STATIC_DRAW,
  buffer: gl.createBuffer() as WebGLBuffer,
})

export const createBufferInfo = (
  gl: WGL2RC,
  bufferInfo: PrimitiveRaw,
  program: WebGLProgram,
): BufferInfo => ({
  data: bufferInfo.data,
  target: gl.ARRAY_BUFFER,
  usage: bufferInfo?.usage ?? gl.STATIC_DRAW,
  buffer: bufferInfo?.buffer ?? (gl.createBuffer() as WebGLBuffer),
  type: gl.FLOAT,
  attributes: bufferInfo.attributes.map((attributeInfo) => ({
    ...attributeInfo,
    type: attributeInfo.type ?? gl.FLOAT,
    stride: attributeInfo.stride ?? 0,
    offset: attributeInfo.offset ?? 0,
    location: gl.getAttribLocation(program, attributeInfo.name),
  })),
})

export const createBufferInfoForProgram = (
  gl: WGL2RC,
  primitive: PrimitiveData,
  program: WebGLProgram,
): PrimitiveBuffer => {
  const bufferInfo = primitive.buffers.map((bufInfo) =>
    createBufferInfo(gl, bufInfo, program),
  )
  const indices = createIndicesInfo(gl, primitive.indices)

  return {
    bufferInfo,
    indices,
  }
}
