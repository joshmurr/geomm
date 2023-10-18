export type Vec2 = { x: number; y: number }
export type Vec3 = { x: number; y: number; z: number }
export type Polygon = {
  verts: Vec2[]
  pos?: Vec2
  rotation?: number
  strokeStyle?: string
  fillStyle?: string
}

/* Axis Aligned Bounding Box */
export type AABB = {
  center: Vec2
  halfWidth: number
  halfHeight: number
}

/* Bounding Circle */
export type BC = {
  center: Vec2
  radius: number
}
