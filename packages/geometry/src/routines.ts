import { MeshBufferGroup } from '@geomm/webgl'
import { cross3, normalize3, sub3, vec3 } from './vec3'

export const computeFaceNormals = ({ buffers, indices }: MeshBufferGroup) => {
  if (!indices) {
    throw new Error('Must be an indexed mesh')
  }
  if (indices.length % 3 !== 0) {
    throw new Error('Indices length must be a multiple of 3')
  }
  const positions = buffers.find((b) =>
    b.attributes.find((a) => a.name === 'i_Position'),
  )?.data
  if (!positions) {
    throw new Error('Must have positions')
  }
  const normals = new Float32Array(indices.length * 3)
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i]
    const i1 = indices[i + 1]
    const i2 = indices[i + 2]

    const v0 = vec3(
      positions[i0 * 3],
      positions[i0 * 3 + 1],
      positions[i0 * 3 + 2],
    )

    const v1 = vec3(
      positions[i1 * 3],
      positions[i1 * 3 + 1],
      positions[i1 * 3 + 2],
    )

    const v2 = vec3(
      positions[i2 * 3],
      positions[i2 * 3 + 1],
      positions[i2 * 3 + 2],
    )

    const e1 = sub3(v1, v0)
    const e2 = sub3(v2, v0)
    const n = normalize3(cross3(e1, e2))

    normals.set(Object.values(n), indices[i] * 3)
    normals.set(Object.values(n), indices[i] * 3 + 3)
    normals.set(Object.values(n), indices[i] * 3 + 6)
  }

  buffers.push({
    attributes: [
      {
        name: 'i_Normal',
        numComponents: 3,
      },
    ],
    data: normals,
  })

  return normals
}

export const addFaceColors = ({ buffers, indices }: MeshBufferGroup) => {
  if (!indices) {
    throw new Error('Must be an indexed mesh')
  }
  if (indices.length % 3 !== 0) {
    throw new Error('Indices length must be a multiple of 3')
  }
  const positions = buffers.find((b) =>
    b.attributes.find((a) => a.name === 'i_Position'),
  )?.data
  if (!positions) {
    throw new Error('Must have positions')
  }

  const colors = new Float32Array(indices.length * 4)
  for (let i = 0; i < indices.length; i += 3) {
    const rgba = [Math.random(), Math.random(), Math.random(), 1]
    colors.set(rgba, indices[i] * 4)
    colors.set(rgba, indices[i] * 4 + 4)
    colors.set(rgba, indices[i] * 4 + 8)
  }

  buffers.push({
    attributes: [
      {
        name: 'i_Color',
        numComponents: 4,
      },
    ],
    data: colors,
  })

  return colors
}
