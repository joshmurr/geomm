import type { Vec2, Vec3 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import {
  ceil,
  distanceSq,
  floor,
  normalize,
  rad,
  vec2,
  vec3,
} from '@geomm/maths'

/* TODO: This is currently the opposide of DRY. But that's kind of ideal.
 * It's these kinds of routines which help point out how API's should be
 * formed IMO, as you can see the patterns emerge.
 */

const SIZE = vec2(512, 512)
const CELLSIZE = 16
const CELLCOUNT = vec2(SIZE.x / CELLSIZE, SIZE.y / CELLSIZE)
const N_CELLS = CELLCOUNT.x * CELLCOUNT.y

const MOUSE = vec2(-1, -1)

const pallette = [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1), vec3(1, 1, 0)]

const vec2rgb = (v: Vec3) =>
  `rgb(${floor(v.x * 255)}, ${floor(v.y * 255)}, ${floor(v.z * 255)})`

const [c, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(c)

const generateMap = <V>(length: number, itemFn: (i: number) => V) => {
  return Array.from({ length }, (_, i) => itemFn(i))
}

let colors = generateMap(N_CELLS, (i) => {
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

const circularVel = (i: number) => {
  const x = i % CELLCOUNT.x
  const y = Math.floor(i / CELLCOUNT.x)
  const center = vec2(CELLCOUNT.x / 2, CELLCOUNT.y / 2)
  const pos = vec2(x, y)
  const dir = normalize(vec2(center.x - pos.x, center.y - pos.y))
  /* Perpendicular vector */
  const p = vec2(-dir.y, dir.x)
  return p
}

const quartersVel = (i: number) => {
  const x = i % CELLCOUNT.x
  const y = Math.floor(i / CELLCOUNT.x)
  return vec2(
    y < CELLCOUNT.y / 2 ? 0.5 : -0.5,
    x < CELLCOUNT.x / 2 ? -0.5 : 0.5,
  )
}

let velocities = generateMap(N_CELLS, circularVel)

let divergence = generateMap(N_CELLS, () => 0)
let pressure = generateMap(N_CELLS, () => 0)

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

const lerpVec2 = (a: Vec2, b: Vec2, t: number) => {
  return vec2(a.x * (1 - t) + b.x * t, a.y * (1 - t) + b.y * t)
}

const sampleMapVec2 = (map: Vec2[], s: Vec2) => {
  const ix0 = smallerIndex(s.x, CELLCOUNT.x)
  const ix1 = largerIndex(s.x, CELLCOUNT.y)
  const iy0 = smallerIndex(s.y, CELLCOUNT.x)
  const iy1 = largerIndex(s.y, CELLCOUNT.y)
  const t = vec2(s.x - floor(s.x), s.y - floor(s.y))
  const idx0 = iy0 * CELLCOUNT.x + ix0
  const idx1 = iy0 * CELLCOUNT.x + ix1
  const idx2 = iy1 * CELLCOUNT.x + ix0
  const idx3 = iy1 * CELLCOUNT.x + ix1
  const mixA = lerpVec2(map[idx0], map[idx1], t.x)
  const mixB = lerpVec2(map[idx2], map[idx3], t.x)
  const mix = lerpVec2(mixA, mixB, t.x)
  return mix
}

const sampleMapVec3 = (map: Vec3[], s: Vec2) => {
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
  const mix = lerpVec3(mixA, mixB, t.x)
  return mix
}

const updateVelocityMapAdvect = (velocities: Vec2[]) => {
  const newVelocityMap = generateMap(N_CELLS, () => vec2(0, 0))
  for (let y = 0; y < CELLCOUNT.y; y++) {
    for (let x = 0; x < CELLCOUNT.x; x++) {
      const idx = y * CELLCOUNT.x + x
      const vel = velocities[idx]
      const s = vec2(x - vel.x, y - vel.y)
      newVelocityMap[idx] = sampleMapVec2(velocities, s)
    }
  }
  return newVelocityMap
}

const updateColorMap = (velocities: Vec2[], colorMap: Vec3[]) => {
  const newColorMap = generateMap(N_CELLS, () => vec3(0, 0, 0))
  for (let y = 0; y < CELLCOUNT.y; y++) {
    for (let x = 0; x < CELLCOUNT.y; x++) {
      const idx = y * CELLCOUNT.x + x
      const vel = velocities[idx]
      /* The cell behind where this vector is pointing */
      const s = vec2(x - vel.x, y - vel.y)
      newColorMap[idx] = sampleMapVec3(colorMap, s)
    }
  }
  return newColorMap
}

const updateDivergenceMap = (velocities: Vec2[]) => {
  const newDivergenceMap = generateMap(N_CELLS, () => 0)
  for (let y = 0; y < CELLCOUNT.y; y++) {
    for (let x = 0; x < CELLCOUNT.y; x++) {
      const idx = y * CELLCOUNT.x + x
      const up = wrap((y - 1) * CELLCOUNT.x + x, N_CELLS)
      const down = wrap((y + 1) * CELLCOUNT.x + x, N_CELLS)
      const left = wrap(y * CELLCOUNT.x + x - 1, CELLCOUNT.x)
      const right = wrap(y * CELLCOUNT.x + x + 1, CELLCOUNT.x)
      const d =
        velocities[up].y -
        velocities[down].y +
        velocities[left].x -
        velocities[right].x
      newDivergenceMap[idx] = d
    }
  }
  return newDivergenceMap
}

const updatePressureMap = (divergence: number[], n: number) => {
  const newPressureMap = generateMap(N_CELLS, () => 0)
  for (let i = 0; i < n; i++) {
    for (let y = 0; y < CELLCOUNT.y; y++) {
      for (let x = 0; x < CELLCOUNT.y; x++) {
        const idx = y * CELLCOUNT.x + x
        const up = wrap((y - 1) * CELLCOUNT.x + x, N_CELLS)
        const down = wrap((y + 1) * CELLCOUNT.x + x, N_CELLS)
        const left = wrap(y * CELLCOUNT.x + x - 1, CELLCOUNT.x)
        const right = wrap(y * CELLCOUNT.x + x + 1, CELLCOUNT.x)
        const p =
          0.25 *
          (divergence[idx] +
            divergence[up] +
            divergence[down] +
            divergence[left] +
            divergence[right])

        newPressureMap[idx] = p
      }
    }
  }

  return newPressureMap
}

const updateVelocityMapIntegrate = (velocities: Vec2[], pressure: number[]) => {
  const newVelocityMap = generateMap(N_CELLS, () => vec2(0, 0))
  for (let y = 0; y < CELLCOUNT.y; y++) {
    for (let x = 0; x < CELLCOUNT.y; x++) {
      const idx = y * CELLCOUNT.x + x
      const up = wrap((y - 1) * CELLCOUNT.x + x, N_CELLS)
      const down = wrap((y + 1) * CELLCOUNT.x + x, N_CELLS)
      const left = wrap(y * CELLCOUNT.x + x - 1, CELLCOUNT.x)
      const right = wrap(y * CELLCOUNT.x + x + 1, CELLCOUNT.x)
      const rho = 0.99
      // Calculate the average pressure difference along x and y directions
      const pressure_diff_x = (pressure[right] - pressure[left]) / 2
      const pressure_diff_y = (pressure[down] - pressure[up]) / 2
      const fx = velocities[idx].x - pressure_diff_x / rho
      const fy = velocities[idx].y - pressure_diff_y / rho

      if (MOUSE.x > 0 && MOUSE.y > 0) {
        const distSq = distanceSq(MOUSE, vec2(x, y))
        if (distSq < 100) {
          const dir = normalize(vec2(MOUSE.x - x, MOUSE.y - y))
          /* vel = vec2(-dir.y, dir.x) */
          newVelocityMap[idx] = dir
          continue
        }
      }

      newVelocityMap[idx] = vec2(fx, fy)
    }
  }
  return newVelocityMap
}

const drawColors = (cells: Vec3[]) => {
  cells.forEach((color, i) => {
    const x = i % CELLCOUNT.x
    const y = Math.floor(i / CELLCOUNT.x)
    ctx.fillStyle = vec2rgb(color)
    ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE)
    /* ctx.strokeStyle = 'black' */
    /* ctx.strokeRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE) */
  })
}

const drawGrey = (cells: number[]) => {
  cells.forEach((color, i) => {
    const x = i % CELLCOUNT.x
    const y = Math.floor(i / CELLCOUNT.x)
    const k = floor(color * 256)
    ctx.fillStyle = `rgb(${k}, ${k}, ${k})`
    ctx.fillRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE)
    /* ctx.strokeStyle = 'black' */
    /* ctx.strokeRect(x * CELLSIZE, y * CELLSIZE, CELLSIZE, CELLSIZE) */
  })
}

const drawVelocities = (cells: Vec2[], color = 'black') => {
  cells.forEach((vel, i) => {
    const x = i % CELLCOUNT.x
    const y = Math.floor(i / CELLCOUNT.x)
    const theta = rad(vel)
    const arrow = vec2(CELLSIZE * 0.4, 0)
    ctx.strokeStyle = color
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
  const newVelocities = updateVelocityMapAdvect(velocities)
  velocities = newVelocities

  divergence = updateDivergenceMap(velocities)
  const nIter = 4
  pressure = updatePressureMap(divergence, nIter)
  /* drawGrey(divergence) */

  velocities = updateVelocityMapIntegrate(velocities, pressure)

  colors = updateColorMap(velocities, colors)

  drawVelocities(velocities, 'black')

  requestAnimationFrame(draw)
}

draw()

c.addEventListener('mousemove', (e) => {
  MOUSE.x = floor(e.offsetX / CELLSIZE)
  MOUSE.y = floor(e.offsetY / CELLSIZE)
})
c.addEventListener('mouseout', () => {
  MOUSE.x = -1
  MOUSE.y = -1
})
