import { PHI } from '@geomm/maths'
import { VertexIds } from './api'

export const cubeIds: VertexIds = {
  0: [-1, -1, 1], //A:
  1: [1, -1, 1], //B:
  2: [1, 1, 1], //C:
  3: [-1, 1, 1], //D:
  4: [-1, -1, -1], //E:
  5: [-1, 1, -1], //F:
  6: [1, 1, -1], //G:
  7: [1, -1, -1], //H:
  // ---
  8: [0, 1, 0], //I:
  9: [0, -1, 0], //J:
  10: [1, 0, 0], //K:
  11: [-1, 0, 0], //L:
  12: [0, 0, 1], //M:
  13: [0, 0, -1], //N:
}

export const icosahedronIds: VertexIds = {
  0: [0, 1, PHI],
  1: [0, 1, -PHI],
  2: [0, -1, PHI],
  3: [0, -1, -PHI],

  4: [1, PHI, 0],
  5: [1, -PHI, 0],
  6: [-1, PHI, 0],
  7: [-1, -PHI, 0],

  8: [PHI, 0, 1],
  9: [PHI, 0, -1],
  10: [-PHI, 0, 1],
  11: [-PHI, 0, -1],
}
