import { cross3, normalize3, sub3, vec3 } from '@geomm/maths'

export const getFace = (indices: Uint16Array, positions: Float32Array) => {
  const p0 = positions.slice(indices[0] * 3, indices[0] * 3 + 3)
  const p1 = positions.slice(indices[1] * 3, indices[1] * 3 + 3)
  const p2 = positions.slice(indices[2] * 3, indices[2] * 3 + 3)

  return [p0, p1, p2]
}

export const computeFaceColors = (indices: Uint16Array) => {
  const colors = new Float32Array(indices.length * 4)
  for (let i = 0; i < indices.length; i += 3) {
    const rgba = [Math.random(), Math.random(), Math.random(), 1]
    colors.set(rgba, indices[i] * 4)
    colors.set(rgba, indices[i] * 4 + 4)
    colors.set(rgba, indices[i] * 4 + 8)
  }

  return colors
}

export const computeNormal = (positions: Float32Array) => {
  const [p0, p1, p2] = getFace(new Uint16Array([0, 1, 2]), positions)

  const normal = cross3(
    sub3(vec3(p1[0], p1[1], p1[2]), vec3(p0[0], p0[1], p0[2])),
    sub3(vec3(p2[0], p2[1], p2[2]), vec3(p0[0], p0[1], p0[2])),
  )

  return normalize3(normal)
}

export const computeNormals = (
  positions: Float32Array,
  indices: Uint16Array,
) => {
  const normals = new Float32Array(indices.length * 3)
  for (let i = 0; i < indices.length; i += 3) {
    const ids = indices.slice(i, i + 3)

    const [p0, p1, p2] = getFace(ids, positions)

    let normal = cross3(
      sub3(vec3(p1[0], p1[1], p1[2]), vec3(p0[0], p0[1], p0[2])),
      sub3(vec3(p2[0], p2[1], p2[2]), vec3(p0[0], p0[1], p0[2])),
    )

    normal = normalize3(normal)
    const values = Object.values(normal)

    normals.set(values, ids[0] * 3)
    normals.set(values, ids[1] * 3)
    normals.set(values, ids[2] * 3)
  }

  return normals
}
