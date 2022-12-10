export const quad = {
  attributes: [
    {
      name: 'i_Position',
      data: new Float32Array([-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0]),
      numComponents: 3,
      size: 4,
    },
    {
      name: 'i_Normal',
      data: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
      numComponents: 3,
      size: 4,
    },
    {
      name: 'i_TexCoord',
      data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      numComponents: 2,
      size: 1,
    },
  ],
  indices: new Uint16Array([0, 2, 1, 0, 3, 2]),
}
