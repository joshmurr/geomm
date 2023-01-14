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

export const cube = {
  attributes: [
    {
      name: 'i_Position',
      data: new Float32Array([
        // Front face
        -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,

        // Back face
        -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1,

        // Top face
        -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,

        // Bottom face
        -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,

        // Right face
        1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,

        // Left face
        -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
      ]),
      numComponents: 3,
      size: 4,
    },
    {
      name: 'i_Normal',
      data: new Float32Array([
        // Front
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

        // Back
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

        // Top
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,

        // Bottom
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,

        // Right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,

        // Left
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      ]),
      numComponents: 3,
      size: 4,
    },
    {
      name: 'i_TexCoord',
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
      numComponents: 2,
      size: 4,
    },
    {
      name: 'i_Color',
      data: new Float32Array([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,

        1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,

        0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,

        0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1,

        1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,

        1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1,
      ]),
      numComponents: 4,
      size: 4,
    },
  ],
  indices: new Uint16Array([
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
  ]),
}
