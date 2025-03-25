import { computeNormals } from '../routines'
import { cubeIds } from '../vertexIds'

export const tetrahedronVertices = new Float32Array(
  [3, 1, 6, 4, 1, 6, 6, 4, 3, 4, 1, 3].map((i) => cubeIds[i]).flat(),
)

const tetrahedronIndices = new Uint16Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
])

export const tetrahedronNormals = computeNormals(
  tetrahedronVertices,
  tetrahedronIndices,
)

export const indexedTetrahedron = {
  buffers: [
    {
      data: tetrahedronVertices,
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
          size: 4,
        },
      ],
    },
    {
      data: tetrahedronNormals,
      attributes: [
        {
          name: 'i_Normal',
          numComponents: 3,
          size: 4,
        },
      ],
    },
  ],
  indices: tetrahedronIndices,
}
