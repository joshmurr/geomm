import { Mat4, Vec2, Vec4 } from '@geomm/api'
import { transformVec4, vec3 } from '@geomm/maths'

export const toClipspace = (v: Vec4, viewportSize: Vec2) => {
  // Store original w for perspective division
  const invW = 1.0 / v.w

  // Map from NDC [-1,1] to screen space [0,width/height]
  const pixelX = (v.x * invW * 0.5 + 0.5) * viewportSize.x
  const pixelY = (v.y * invW * -0.5 + 0.5) * viewportSize.y

  // Map z from [-1,1] to [0,1] for z-buffer
  const depth = v.z * invW * 0.5 + 0.5

  return vec3(Math.floor(pixelX), Math.floor(pixelY), depth)
}

export const transformToClipspace = (
  v: Vec4,
  mat: Mat4,
  viewportSize: Vec2,
) => {
  const p = transformVec4(v, mat)
  return toClipspace(p, viewportSize)
}
