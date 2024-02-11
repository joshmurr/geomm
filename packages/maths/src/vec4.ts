import { Mat4, Vec4 } from '@geomm/api'

export const vec4 = (x: number, y: number, z: number, w: number) => ({
  x,
  y,
  z,
  w,
})

export const transformMat4 = (a: Vec4, m: Mat4) => {
  const x = m[0] * a.x + m[4] * a.y + m[8] * a.z + m[12] * a.w
  const y = m[1] * a.x + m[5] * a.y + m[9] * a.z + m[13] * a.w
  const z = m[2] * a.x + m[6] * a.y + m[10] * a.z + m[14] * a.w
  const w = m[3] * a.x + m[7] * a.y + m[11] * a.z + m[15] * a.w
  return vec4(x, y, z, w)
}
