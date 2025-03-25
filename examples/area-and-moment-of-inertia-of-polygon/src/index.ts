import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import {
  add,
  centroid,
  cross,
  distance,
  dot,
  scale,
  sub,
  vec2,
} from '@geomm/maths'

const [c, ctx] = canvas2d(512, 512)
appendEl(c)

ctx.fillStyle = '#000'
ctx.fillRect(0, 0, 512, 512)

const drawPoly = (points: Vec2[], color = 'white') => {
  ctx.translate(pos.x, pos.y)
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.translate(-pos.x, -pos.y)
}

const circlePoints = [] as Vec2[]
const NUM_POINTS = 8

const radius = 300
const density = 1
const velocity = vec2(-100 + Math.random() * 200, -100 + Math.random() * 200)
const rotationSpeed = -Math.PI / 2 + Math.random() * Math.PI
const pos = vec2(256, 256)

let area = 0
let momentOfInertia = 0
for (let i = 0; i < NUM_POINTS; i++) {
  const theta = Math.PI * 2 * (i / NUM_POINTS) + Math.PI
  const r = (radius / 2) * (Math.random() - 0.5) + radius / 2
  circlePoints.push({
    x: Math.cos(theta) * r,
    y: Math.sin(theta) * r,
  })
}

const letterJPoints = [
  vec2(0, 0),
  vec2(120, 0),
  vec2(120, 20),
  vec2(80, 20),
  vec2(80, 200),
  vec2(0, 200),
  vec2(0, 180),
  vec2(60, 180),
  vec2(60, 20),
  vec2(0, 20),
]

const points = letterJPoints

const labelPoints = (points: Vec2[]) => {
  ctx.translate(pos.x, pos.y)
  ctx.fillStyle = 'red'
  for (let i = 0; i < points.length; i++) {
    ctx.fillText(`${i}`, points[i].x + 3, points[i].y + 3)
  }
  ctx.translate(-pos.x, -pos.y)
}

for (let i = 1; i < points.length - 1; i++) {
  const p1 = points[0],
    p2 = points[i],
    p3 = points[i + 1]

  drawPoly([p1, p2, p3], 'grey')
  drawPoly(points)
  /* labelPoints([p1, p2, p3]) */

  const cent = centroid(p1, p2, p3)

  const signedTriArea = cross(sub(p3, p1), sub(p2, p1)) / 2

  /* ctx.translate(pos.x, pos.y) */
  /* ctx.fillStyle = 'rgb(0,255,0)' */
  /* ctx.fillText(`${signedTriArea.toFixed(2)}`, cent.x, cent.y - 10) */

  const width = distance(p1, p2)
  const width1 = Math.abs(dot(sub(p1, p2), sub(p3, p2)) / width)

  /* ctx.fillText(`${width1.toFixed(2)}`, cent.x, cent.y) */
  /* ctx.translate(-pos.x, -pos.y) */

  const p4 = add(p2, scale(sub(p1, p2), width1 / width))
  const centreOfMass1 = {
    x: (p2.x + p3.x + p4.x) / 3,
    y: (p2.y + p3.y + p4.y) / 3,
  }
  const centreOfMass2 = {
    x: (p1.x + p3.x + p4.x) / 3,
    y: (p1.y + p3.y + p4.y) / 3,
  }
  const height = (2 * Math.abs(signedTriArea)) / width
  const b = Math.abs(width - width1)
  const momentOfInertia1 =
    density * width1 * height * ((height * height) / 4 + (width1 * width1) / 12)
  const momentOfInertia2 =
    density * b * height * ((height * height) / 4 + (b * b) / 12)
  const mass1 = 0.5 * width1 * height * density
  const mass2 = 0.5 * b * height * density

  const momentOfInertiaCentre1 =
    momentOfInertia1 - mass1 * Math.pow(distance(centreOfMass1, p3), 2)
  const momentOfInertiaCentre2 =
    momentOfInertia2 - mass2 * Math.pow(distance(centreOfMass2, p3), 2)

  area += signedTriArea
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

area = Math.abs(area)
momentOfInertia = Math.abs(momentOfInertia)

console.log('area', area)
console.log('momentOfInertia', momentOfInertia)
