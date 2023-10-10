import { Vec3 } from '@geomm/api'

export const vec3 = (x: number, y: number, z: number) => ({ x, y, z })

export const sub3 = (a: Vec3, b: Vec3) => vec3(a.x - b.x, a.y - b.y, a.z - b.z)

export const add3 = (a: Vec3, b: Vec3) => vec3(a.x + b.x, a.y + b.y, a.z + b.z)

export const mul3 = (a: Vec3, b: Vec3) => vec3(a.x * b.x, a.y * b.y, a.z * b.z)

export const div3 = (a: Vec3, b: Vec3) => vec3(a.x / b.x, a.y / b.y, a.z / b.z)

export const dot3 = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z

export const cross3 = (a: Vec3, b: Vec3) =>
  vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.z)

export const normalize3 = (a: Vec3) => {
  const len = Math.sqrt(dot3(a, a))
  return vec3(a.x / len, a.y / len, a.z / len)
}
export const mag3 = (a: Vec3) => Math.sqrt(dot3(a, a))

export const distanceSq3 = (a: Vec3, b: Vec3) => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return dx * dx + dy * dy + dz * dz
}

export const distance3 = (a: Vec3, b: Vec3) => Math.sqrt(distanceSq3(a, b))

export const centroid3 = (a: Vec3, b: Vec3, c: Vec3) =>
  vec3((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3)

export const centroid3Float = (
  a: Float32Array,
  b: Float32Array,
  c: Float32Array,
) => {
  return new Float32Array([
    (a[0] + b[0] + c[0]) / 3,
    (a[1] + b[1] + c[1]) / 3,
    (a[2] + b[2] + c[2]) / 3,
  ])
}
