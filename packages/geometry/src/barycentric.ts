import { Vec2, Vec3 } from '@geomm/api'
import { dot, sub, vec3 } from '@geomm/maths'

export const barycentric = <T extends Vec3 | Vec2>(A: T, B: T, C: T, P: T) => {
  const v0 = sub(B, A)
  const v1 = sub(C, A)
  const v2 = sub(P, A)
  const d00 = dot(v0, v0)
  const d01 = dot(v0, v1)
  const d11 = dot(v1, v1)
  const d20 = dot(v2, v0)
  const d21 = dot(v2, v1)
  const denom = d00 * d11 - d01 * d01

  if (Math.abs(denom) < 1e-6) {
    return vec3(-1, 1, 1)
  }

  const v = (d11 * d20 - d01 * d21) / denom
  const w = (d00 * d21 - d01 * d20) / denom
  const u = 1.0 - v - w
  return vec3(u, v, w)
}
