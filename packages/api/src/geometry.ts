export type Vec2 = { x: number; y: number }
export type Vec3 = { x: number; y: number; z: number }
export type Vec4 = { x: number; y: number; z: number; w: number }

export type Mat3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]
export type Mat4 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export type Polygon = {
  verts: Vec2[]
  pos?: Vec2
  rotation?: number
  strokeStyle?: string
  fillStyle?: string
}

export type PhysicsObject2D = Polygon & {
  vel: Vec2
  aabb: AABB
  bc: BC
  pos: Vec2
  rotation: number
  rotationSpeed: number
  mass: number
  momentOfInertia: number
  prevVerts: Vec2[]
  currVerts: Vec2[]
  density: number
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
