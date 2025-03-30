import { IndexedBuffer } from './api'
import { computeNormal } from './routines'

interface Face {
  vertexIndices: number[]
  textureIndices?: number[]
  normalIndices?: number[]
}

interface PrelimBuffers {
  i_Position: Float32Array
  i_Normal?: Float32Array
  i_TexCoord?: Float32Array
  indices: Uint16Array
}

export const parseOBJ = (objFileContent: string) => {
  const lines = objFileContent.split('\n')

  const { faces, ...buffers } = lines.reduce<{
    vertices: number[]
    textureCoordinates: number[]
    normals: number[]
    faces: Face[]
  }>(
    (acc, line) => {
      const trimmedLine = line.trim()

      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        return acc
      }

      const parts = trimmedLine.split(/\s+/)
      const command = parts[0]

      switch (command) {
        case 'v': {
          const parsed = parseVertex(parts)
          if (parsed) {
            acc.vertices.push(...parsed)
          }
          break
        }
        case 'vt': {
          const parsed = parseTextureCoordinate(parts)
          if (parsed) {
            acc.textureCoordinates.push(...parsed)
          }
          break
        }
        case 'vn': {
          const parsed = parseNormal(parts)
          if (parsed) {
            acc.normals.push(...parsed)
          }
          break
        }
        case 'f': {
          const parsed = parseFace(parts)
          if (parsed) {
            acc.faces.push(parsed)
          }
          break
        }
        // Ignore other commands like 'g', 'mtllib', etc. for simplicity
      }
      return acc
    },
    {
      vertices: [],
      textureCoordinates: [],
      normals: [],
      faces: [],
    },
  )

  const prelimBuffers = faces.reduce<PrelimBuffers>(
    (acc, face, i) => {
      const { vertexIndices, textureIndices, normalIndices } = face

      const vertices = vertexIndices.map((index) =>
        buffers.vertices.slice(index * 3, index * 3 + 3),
      )
      acc.i_Position.set(vertices.flat(), i * 9)

      if (textureIndices && acc.i_TexCoord) {
        const textureCoordinates = textureIndices.map((index) =>
          buffers.textureCoordinates.slice(index * 2, index * 2 + 2),
        )
        acc.i_TexCoord.set(textureCoordinates.flat(), i * 6)
      }

      if (acc.i_Normal) {
        if (normalIndices) {
          const normals = normalIndices.map((index) =>
            buffers.normals.slice(index * 3, index * 3 + 3),
          )
          acc.i_Normal.set(normals.flat(), i * 9)
        } else {
          const normal = computeNormal(new Float32Array(vertices.flat()))
          const values = Object.values(normal)
          acc.i_Normal.set([...values, ...values, ...values], i * 9)
        }
      }

      acc.indices.set([i * 3, i * 3 + 1, i * 3 + 2], i * 3)

      return acc
    },
    {
      i_Position: new Float32Array(faces.length * 9),
      indices: new Uint16Array(faces.length * 3),
      i_Normal: new Float32Array(faces.length * 9),
      i_TexCoord:
        buffers.textureCoordinates.length > 0
          ? new Float32Array(faces.length * 6)
          : undefined,
    },
  )

  return Object.entries(prelimBuffers).reduce<IndexedBuffer>(
    (acc, [name, buffer]) => {
      if (buffer && name.startsWith('i_')) {
        acc.buffers.push({
          data: buffer,
          attributes: [
            {
              name,
              numComponents: name == 'i_TexCoord' ? 2 : 3,
              size: 4,
            },
          ],
        })
      }
      return acc
    },
    {
      buffers: [],
      indices: prelimBuffers.indices,
    },
  )
}

function parseVertex(parts: string[]) {
  if (parts.length < 4) {
    return
  }

  return [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]
}

function parseTextureCoordinate(parts: string[]) {
  if (parts.length < 3) {
    return
  }

  return [parseFloat(parts[1]), parseFloat(parts[2])]
}

function parseNormal(parts: string[]) {
  if (parts.length < 4) {
    return
  }

  return [parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]
}

function parseFace(parts: string[]) {
  if (parts.length < 4) {
    return
  }

  const vertexIndices: number[] = []
  const textureIndices: number[] = []
  const normalIndices: number[] = []

  // Start from index 1 to skip the 'f' command
  for (let i = 1; i < parts.length; i++) {
    const indices = parts[i].split('/')

    // Vertex indices (required)
    if (indices[0]) {
      // OBJ indices are 1-based, convert to 0-based
      vertexIndices.push(parseInt(indices[0], 10) - 1)
      // this.indices.push(parseInt(indices[0], 10) - 1)
    }

    if (indices.length > 1 && indices[1]) {
      textureIndices.push(parseInt(indices[1], 10) - 1)
    }

    if (indices.length > 2 && indices[2]) {
      normalIndices.push(parseInt(indices[2], 10) - 1)
    }
  }

  const face: Face = {
    vertexIndices,
  }

  if (textureIndices.length > 0) {
    face.textureIndices = textureIndices
  }

  if (normalIndices.length > 0) {
    face.normalIndices = normalIndices
  }

  return face
}
