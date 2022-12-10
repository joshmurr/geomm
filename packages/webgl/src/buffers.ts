import type { TypedArray } from '@geomm/api'
import type {
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

export const attributeFound = (bufferInfo: BufferInfo) => {
  const found = bufferInfo.location >= 0
  if (!found) console.warn(`Cannot find ${bufferInfo.name} in program.`)
  return found
}

export const setupVertexAttrib = (
  gl: WebGL2RenderingContext,
  bufferInfo: BufferInfo,
  offset: number,
) => {
  gl.enableVertexAttribArray(bufferInfo.location)
  gl.vertexAttribPointer(
    bufferInfo.location,
    bufferInfo.numComponents,
    bufferInfo.type,
    false, // normalize
    bufferInfo.stride,
    offset,
  )
}

export const createVAO = (
  gl: WebGL2RenderingContext,
  primitive: PrimitiveBuffer,
): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray() as WebGLVertexArrayObject
  gl.bindVertexArray(vao)

  for (const bufferInfo of Object.values(primitive.attributes)) {
    if (!attributeFound(bufferInfo)) continue
    let offset = 0
    bindBufferData(gl, bufferInfo)
    setupVertexAttrib(gl, bufferInfo, offset)
    offset += bufferInfo.numComponents * bufferInfo.size
  }

  bindBufferData(gl, primitive.indices)

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
  usage: gl.STATIC_DRAW,
  numComponents: bufferInfo.numComponents,
  buffer: gl.createBuffer() as WebGLBuffer,
  type: gl.FLOAT,
  size: bufferInfo.size,
  stride: 0,
  name: bufferInfo.name,
  location: gl.getAttribLocation(program, bufferInfo.name),
})

export const createBufferInfoForProgram = (
  gl: WGL2RC,
  primitive: PrimitiveData,
  program: WebGLProgram,
): PrimitiveBuffer => {
  const attributes = primitive.attributes.map((bufferInfo) =>
    createBufferInfo(gl, bufferInfo, program),
  )
  const indices = createIndicesInfo(gl, primitive.indices)

  return {
    attributes,
    indices,
  }
}
