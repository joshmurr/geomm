import { appendEl, canvas2d } from '@geomm/dom'
import {
  normalMat,
  normalize3,
  vec2,
  vec3,
  vec4,
  transformDirection,
  transformVec4,
  identity,
  matmul,
  translate,
  createPerspectiveMatrix,
  createViewMatrix,
  createAxisAngleRotationMatrix,
  combineMatrices,
} from '@geomm/maths'
import {
  barycentric,
  cubeIndices,
  cubeNormals,
  cubeVertices,
  toClipspace,
} from '@geomm/geometry'
import { Reducer, transduce } from '@geomm/core'
import { floatRgbToIntRgb, RGB } from '@geomm/color'
import type { Mat4, Vec2, Vec3 } from '@geomm/api'
import {
  createPhongMaterial,
  FragmentShader,
  phongShader,
  VertexShader,
  Uniforms,
  normalShader,
  lightingShader,
} from './shaders'

let drawing = false
const RESOLUTION = 64
const SIZE = vec2(RESOLUTION, RESOLUTION)
const [c, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(c)

c.style.width = '512px'
c.style.height = '512px'
c.style.imageRendering = 'pixelated'

const viewMat = createViewMatrix()

const fovY = Math.PI / 4
const aspect = 1
const NEAR = 0.1
const FAR = 50
const perspectiveMat = createPerspectiveMatrix(fovY, aspect, NEAR, FAR)

const LIGHT_DIR = normalize3(vec3(0, 3, 4))

const computeTriangleBoundingBox = (vertices: Vec3[], screenSize: Vec2) => {
  const min = vec2(screenSize.x, screenSize.y)
  const max = vec2(0, 0)

  for (const vertex of vertices) {
    min.x = Math.max(0, Math.min(min.x, vertex.x))
    min.y = Math.max(0, Math.min(min.y, vertex.y))

    max.x = Math.min(screenSize.x, Math.max(max.x, vertex.x))
    max.y = Math.min(screenSize.y, Math.max(max.y, vertex.y))
  }

  return { min, max }
}

const interpolateZValue = (
  vertices: Vec3[],
  barycentricCoords: Vec3,
): number => {
  return (
    vertices[0].z * barycentricCoords.x +
    vertices[1].z * barycentricCoords.y +
    vertices[2].z * barycentricCoords.z
  )
}

const rasterizeTriangle = (
  points: Vec3[],
  drawFn: (x: number, y: number, color: RGB) => void,
  fragmentShader: FragmentShader,
  zBuffer: number[],
  near = 0.1, // Your near clipping plane
  far = 100, // Your far clipping plane
) => {
  const { min: bboxMin, max: bboxMax } = computeTriangleBoundingBox(
    points,
    SIZE,
  )

  /* Use BB as limits for Barycentric computation */
  const p = vec3(0, 0, 0)
  for (p.x = bboxMin.x; p.x <= bboxMax.x; p.x++) {
    for (p.y = bboxMin.y; p.y <= bboxMax.y; p.y++) {
      const bcScreen = barycentric(points[0], points[1], points[2], p)
      if (bcScreen.x < 0 || bcScreen.y < 0 || bcScreen.z < 0) {
        continue
      }

      p.z = interpolateZValue(points, bcScreen)

      const normalizedZ = normalizeDepth(p.z, near, far)

      const pixIdx = Math.floor(p.x) + Math.floor(p.y) * SIZE.x
      /* If closer than previous pixel, draw it */
      if (zBuffer[pixIdx] > normalizedZ) {
        zBuffer[pixIdx] = normalizedZ
        const color = fragmentShader({
          position: p,
          barycentricCoords: bcScreen,
          vertices: points,
        })
        drawFn(p.x, p.y, floatRgbToIntRgb(color))
      }
    }
  }
}

const imageBuffer = new ImageData(SIZE.x, SIZE.y)
const drawOnBuffer = (buf: ImageData) => (x: number, y: number, color: RGB) => {
  const i = (y * SIZE.x + x) * 4
  buf.data[i] = color[0]
  buf.data[i + 1] = color[1]
  buf.data[i + 2] = color[2]
  buf.data[i + 3] = 255
}

const BLACK_BUFFER = new ImageData(SIZE.x, SIZE.y).data
  .fill(0)
  .map((_, i) => (i % 4 === 3 ? 255 : 0))

const vertexShader: VertexShader = (
  { vertices, indices, normals },
  { modelMat, viewMat, perspectiveMat },
) => {
  const mvp = combineMatrices([perspectiveMat, viewMat, modelMat])

  const clipCoords: Vec3[] = []
  const normalMatrix = normalMat(modelMat)
  const transformedNormals: Vec3[] = []

  for (let i = 0; i < indices.length; i += 3) {
    const ids = indices.slice(i, i + 3)

    // World Coords of Face
    const p0 = vertices.slice(ids[0] * 3, ids[0] * 3 + 3)
    const p1 = vertices.slice(ids[1] * 3, ids[1] * 3 + 3)
    const p2 = vertices.slice(ids[2] * 3, ids[2] * 3 + 3)

    // Transform vertices to Clip Space (MVP matrix)
    const t0 = transformVec4(vec4(p0[0], p0[1], p0[2], 1), mvp)
    const t1 = transformVec4(vec4(p1[0], p1[1], p1[2], 1), mvp)
    const t2 = transformVec4(vec4(p2[0], p2[1], p2[2], 1), mvp)

    // Convert to Clipspace / Screen Coords
    const c0 = toClipspace(t0, SIZE)
    const c1 = toClipspace(t1, SIZE)
    const c2 = toClipspace(t2, SIZE)

    clipCoords.push(c0)
    clipCoords.push(c1)
    clipCoords.push(c2)

    const n = normals.slice(ids[0] * 3, ids[0] * 3 + 3)
    const normal = vec3(n[0], n[1], n[2])
    transformedNormals.push(transformDirection(normal, normalMatrix))
  }

  return { clipCoords, normals: transformedNormals }
}

const normalizeDepth = (z: number, near: number, far: number): number => {
  return (z - near) / (far - near)
}

let t = 0
const draw = () => {
  const scale = 0.01
  const smallTime = t++ * scale

  imageBuffer.data.set(BLACK_BUFFER)

  const axis = { x: 1, y: 1, z: 0.5 }
  const angle = smallTime
  const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)
  const modelMat = matmul(translate(identity, vec3(0, 0, -8)), rotationMatrix)

  const { clipCoords, normals } = vertexShader(
    {
      vertices: cubeVertices,
      indices: cubeIndices,
      normals: cubeNormals,
    },
    { modelMat, viewMat, perspectiveMat },
  )

  let zBuffer = new Array(SIZE.x * SIZE.y).fill(1)

  for (let i = 0; i < clipCoords.length; i += 3) {
    const points = [clipCoords[i], clipCoords[i + 1], clipCoords[i + 2]]
    /* This could/should be narrowed down for different shaders */
    const uniforms: Uniforms = {
      normal: normals[i / 3],
      lightDir: LIGHT_DIR,
      viewDir: vec3(0, 0, 1),
      edgeColor: [0, 1, 1],
      fillColor: [0, 0, 1],
      edgeThickness: 0.03,
      material: createPhongMaterial(
        [0.5, 0.1, 1.0],
        [0.2, 1.0, 0.8],
        [1.0, 1.0, 1.0],
        36,
      ),
      lightColor: [1, 1, 1],
    }

    rasterizeTriangle(
      points,
      drawOnBuffer(imageBuffer),
      lightingShader(uniforms),
      zBuffer,
      NEAR,
      FAR,
    )
  }
  ctx.putImageData(imageBuffer, 0, 0)

  if (drawing) requestAnimationFrame(draw)
}

requestAnimationFrame(draw)

c.addEventListener('click', () => {
  drawing = !drawing
  if (drawing) requestAnimationFrame(draw)
})
