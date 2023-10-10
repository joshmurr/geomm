import { cubeIds } from '../vertexIds'

export const indexedCube = {
  buffers: [
    {
      data: new Float32Array(
        [
          // Front
          0, 1, 2, 0, 2, 3,
          // Back
          7, 4, 5, 7, 5, 6,
          // Top
          3, 2, 6, 3, 6, 5,
          // Bottom
          4, 7, 1, 4, 1, 0,
          // Left
          4, 0, 3, 4, 3, 5,
          // Right
          1, 7, 6, 1, 6, 2,
        ]
          .map((i) => cubeIds[i])
          .flat(),
      ),
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
          size: 4,
        },
      ],
    },
    {
      data: new Float32Array([
        // Front
        0, 0, 1, 0, 1, 1, 0, 1,
        // Back
        0, 0, 1, 0, 1, 1, 0, 1,
        // Top
        0, 0, 1, 0, 1, 1, 0, 1,
        // Bottom
        0, 0, 1, 0, 1, 1, 0, 1,
        // Right
        0, 0, 1, 0, 1, 1, 0, 1,
        // Left
        0, 0, 1, 0, 1, 1, 0, 1,
      ]),

      attributes: [
        {
          name: 'i_TexCoord',
          numComponents: 2,
          size: 4,
        },
      ],
    },
  ],
  /* prettier-ignore */
  indices: new Uint16Array(
    Array.from({ length: 6 * 2  /*faces*/ * 3 }, (_, i) => i),
  ),
}
