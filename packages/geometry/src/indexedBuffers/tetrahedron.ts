import { cubeIds } from '../vertexIds'

export const indexedTetrahedron = {
  buffers: [
    {
      /* prettier-ignore */
      data: new Float32Array([
        3, 1, 6,
        4, 1, 6,
        6, 4, 3,
        4, 1, 3
      ].map(i => cubeIds[i]).flat()),
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
          size: 4,
        },
      ],
    },
  ],
  indices: new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
}
