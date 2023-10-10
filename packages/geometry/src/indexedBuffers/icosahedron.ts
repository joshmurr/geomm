import { icosahedronIds } from '../vertexIds'

export const indexedIcosahedron = {
  buffers: [
    {
      /* prettier-ignore */
      data: new Float32Array([
        // TOP
        1, 3, 11,
        1, 11, 6,
        1, 6, 4,
        1, 4, 9,
        1, 9, 3,
        // MIDDLE
        3, 7, 11,
        3, 5, 7,
        11, 7, 10,
        6, 11, 10,
        6, 10, 0,
        6, 0, 4,
        4, 0, 8,
        4, 8, 9,
        9, 8, 5,
        3, 9, 5,
        // BOTTOM
        2, 0, 10,
        2, 10, 7,
        2, 7, 5,
        2, 5, 8,
        2, 8, 0,
      ].map(i => icosahedronIds[i]).flat()),
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
          size: 4,
        },
      ],
    },
  ],
  indices: new Uint16Array(
    Array.from({ length: 20 /*faces*/ * 3 }, (_, i) => i),
  ),
}
