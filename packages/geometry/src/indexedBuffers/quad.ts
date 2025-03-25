export const quadVertices = new Float32Array([
  -1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0,
])
export const quadTexCoords = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])
export const quadNormals = new Float32Array([
  0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
])
export const quadIndices = new Uint16Array([0, 2, 1, 0, 3, 2])

export const indexedQuad = {
  buffers: [
    {
      data: quadVertices,
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
          size: 4,
        },
      ],
    },
    {
      data: quadNormals,
      attributes: [
        {
          name: 'i_Normal',
          numComponents: 3,
          size: 4,
        },
      ],
    },
    {
      data: quadTexCoords,
      attributes: [
        {
          name: 'i_TexCoord',
          numComponents: 2,
          size: 1,
        },
      ],
    },
  ],
  indices: quadIndices,
}
