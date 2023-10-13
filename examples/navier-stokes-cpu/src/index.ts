import type { Vec2, Vec3 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import { ceil, floor, normalize, rad, vec2, vec3 } from '@geomm/maths'

const SIZE = vec2(512, 512)
const CELLSIZE = 16
const CELLCOUNT = vec2(SIZE.x / CELLSIZE, SIZE.y / CELLSIZE)

const pallette = [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1), vec3(1, 1, 0)]

const vec2rgb = (v: Vec3) =>
  `rgb(${floor(v.x * 255)}, ${floor(v.y * 255)}, ${floor(v.z * 255)})`

const [c, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(c)

let colors = Array.from({ length: CELLCOUNT.x * CELLCOUNT.y }, (_, i) => {
  const x = i % CELLCOUNT.x
  const y = Math.floor(i / CELLCOUNT.x)
  if (x < CELLCOUNT.x / 2) {
    if (y < CELLCOUNT.y / 2) {
      return pallette[0]
    } else {
      return pallette[1]
    }
  } else {
    if (y < CELLCOUNT.y / 2) {
      return pallette[2]
    } else {
      return pallette[3]
    }
  }
})

const velocities = Array.from({ length: CELLCOUNT.x * CELLCOUNT.y }, (_, i) => {
  const x = i % CELLCOUNT.x
  const y = Math.floor(i / CELLCOUNT.x)
  const center = vec2(CELLCOUNT.x / 2, CELLCOUNT.y / 2)
  const pos = vec2(x, y)
  const dir = normalize(vec2(center.x - pos.x, center.y - pos.y))
  return dir
})

function wrap(n: number, mapResolution: number) {
  return (n + mapResolution) % mapResolution
}
function smallerIndex(n: number, mapResolution: number) {
  return wrap(floor(n + mapResolution) % mapResolution, mapResolution)
}

function largerIndex(n: number, mapResolution: number) {
  return wrap(ceil(n + mapResolution) % mapResolution, mapResolution)
}

const lerpVec3 = (a: Vec3, b: Vec3, t: number) => {
  return vec3(
    a.x * (1 - t) + b.x * t,
    a.y * (1 - t) + b.y * t,
    a.z * (1 - t) + b.z * t,
  )
}

const sampleMap = (map: Vec3[], s: Vec2) => {
  const ix0 = smallerIndex(s.x, CELLCOUNT.x)
  const ix1 = largerIndex(s.x, CELLCOUNT.y)
  const iy0 = smallerIndex(s.y, CELLCOUNT.x)
  const iy1 = largerIndex(s.y, CELLCOUNT.y)
  const t = vec2(s.x - floor(s.x), s.y - floor(s.y))
  const idx0 = iy0 * CELLCOUNT.x + ix0
  const idx1 = iy0 * CELLCOUNT.x + ix1
  const idx2 = iy1 * CELLCOUNT.x + ix0
  const idx3 = iy1 * CELLCOUNT.x + ix1
  const mixA = lerpVec3(map[idx0], map[idx1], t.x)
  const mixB = lerpVec3(map[idx2], map[idx3], t.x)
  const mix = lerpVec3(mixA, mixB, t.y)
  return mix
}

const updateColorMap = (velocities: Vec2[], colorMap: Vec3[]) => {
  const newColorMap = Array.from({ length: CELLCOUNT.x * CELLCOUNT.y }, () =>
    vec3(0, 0, 0),
  )
  for (let y = 0; y < CELLCOUNT.y; y++) {
    for (let x = 0; x < CELLCOUNT.y; x++) {
      const idx = y * CELLCOUNT.x + x
      const vel = velocities[idx]
      /* The cell behind where this vector is pointing */
      const s = vec2(x - vel.x, y - vel.y)
      newColorMap[idx] = sampleMap(colorMap, s)
    }
  }
  return newColorMap
}

const drawColors = (cells: Vec3[]) => {
  cells.forEach((color, i) => {
    const x = i % CELLCOUNT.x
    const y = Math.floor(i / CELLCOUNT.x)
    ctx.fillStyle = vec2rgb(color)
    ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE)
    ctx.strokeStyle = 'black'
    ctx.strokeRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE)
  })
}

const drawVelocities = (cells: Vec2[]) => {
  cells.forEach((vel, i) => {
    const x = i % CELLCOUNT.x
    const y = Math.floor(i / CELLCOUNT.x)
    const theta = rad(vel)
    const arrow = vec2(CELLSIZE * 0.4, 0)
    ctx.strokeStyle = 'black'
    ctx.save()
    ctx.translate(x * CELLSIZE + CELLSIZE / 2, y * CELLSIZE + CELLSIZE / 2)
    ctx.rotate(theta)
    ctx.beginPath()
    ctx.moveTo(-arrow.x, -arrow.y)
    ctx.lineTo(arrow.x, arrow.y)
    ctx.moveTo(arrow.x, arrow.y)
    ctx.lineTo(0, -CELLSIZE * 0.4)
    ctx.moveTo(arrow.x, arrow.y)
    ctx.lineTo(0, CELLSIZE * 0.4)
    ctx.stroke()
    ctx.restore()
  })
}

const draw = () => {
  drawColors(colors)
  drawVelocities(velocities)
  const newColors = updateColorMap(velocities, colors)
  /* console.log(newcolors) */

  colors = newColors
}

draw()

c.addEventListener('click', () => draw())
