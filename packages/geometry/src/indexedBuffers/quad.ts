export const indexedQuad = {
  buffers: [
    {
      data: new Float32Array([-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0]),
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
          size: 4,
        },
      ],
    },
    {
      data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
      attributes: [
        {
          name: 'i_Normal',
          numComponents: 3,
          size: 4,
        },
      ],
    },
    {
      data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      attributes: [
        {
          name: 'i_TexCoord',
          numComponents: 2,
          size: 1,
        },
      ],
    },
  ],
  indices: new Uint16Array([0, 2, 1, 0, 3, 2]),
}
