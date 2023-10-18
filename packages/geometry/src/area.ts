import { Vec2 } from '@geomm/api'
import { abs, cross, sub } from '@geomm/maths'

export const areaOfPolygon = (verts: Vec2[]) => {
  let area = 0
  for (let i = 1; i < verts.length - 1; i++) {
    const p1 = verts[0],
      p2 = verts[i],
      p3 = verts[i + 1]
    const signedTriArea = cross(sub(p3, p1), sub(p2, p1)) / 2
    area += signedTriArea
  }
  return abs(area)
}
