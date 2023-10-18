import { Vec2 } from '@geomm/api'
import { abs, add, cross, distance, dot, scale, sub, vec2 } from '@geomm/maths'

export const momentOfInertiaOfPolygon = (verts: Vec2[], density: number) => {
  let momentOfInertia = 0
  for (let i = 1; i < verts.length - 1; i++) {
    const p1 = verts[0],
      p2 = verts[i],
      p3 = verts[i + 1]

    const signedTriArea = cross(sub(p3, p1), sub(p2, p1)) / 2
    const width = distance(p1, p2)
    const width1 = abs(dot(sub(p1, p2), sub(p3, p2)) / width)

    const p4 = add(p2, scale(sub(p1, p2), width1 / width))
    const centreOfMass1 = {
      x: (p2.x + p3.x + p4.x) / 3,
      y: (p2.y + p3.y + p4.y) / 3,
    }
    const centreOfMass2 = {
      x: (p1.x + p3.x + p4.x) / 3,
      y: (p1.y + p3.y + p4.y) / 3,
    }
    const height = (2 * abs(signedTriArea)) / width
    const b = abs(width - width1)
    const momentOfInertia1 =
      density *
      width1 *
      height *
      ((height * height) / 4 + (width1 * width1) / 12)
    const momentOfInertia2 =
      density * b * height * ((height * height) / 4 + (b * b) / 12)
    const mass1 = 0.5 * width1 * height * density
    const mass2 = 0.5 * b * height * density

    const momentOfInertiaCentre1 =
      momentOfInertia1 - mass1 * Math.pow(distance(centreOfMass1, p3), 2)
    const momentOfInertiaCentre2 =
      momentOfInertia2 - mass2 * Math.pow(distance(centreOfMass2, p3), 2)

    const momentOfInertiaPart1 =
      momentOfInertiaCentre1 +
      mass1 * Math.pow(distance(centreOfMass1, vec2(0, 0)), 2)
    const momentOfInertiaPart2 =
      momentOfInertiaCentre2 +
      mass2 * Math.pow(distance(centreOfMass2, vec2(0, 0)), 2)
    if (cross(sub(p1, p3), sub(p4, p3)) > 0) {
      momentOfInertia += momentOfInertiaPart1
    } else {
      momentOfInertia -= momentOfInertiaPart1
    }
    if (cross(sub(p4, p3), sub(p2, p3)) > 0) {
      momentOfInertia += momentOfInertiaPart2
    } else {
      momentOfInertia -= momentOfInertiaPart2
    }
  }

  return abs(momentOfInertia)
}
