import {
  composeTransducers,
  concat,
  Reducer,
  transduce,
  Transducer,
} from '@geomm/core'
import {
  centroid3,
  combineMatrices,
  createAxisAngleRotationMatrix,
  createPerspectiveMatrix,
  createViewMatrix,
  dot3,
  identity,
  matmul,
  normalize3,
  normalMat,
  transformDirection,
  transformVec4,
  translate,
  vec2,
  vec3,
  vec4,
} from '@geomm/maths'
import type { Mat4, Vec2, Vec3, Vec4 } from '@geomm/api'
import {
  cubeIndices,
  cubeNormals,
  cubeVertices,
  getFace,
  toClipspace,
} from '@geomm/geometry'
import { appendEl, canvas2d } from '@geomm/dom'
import { floatToIntRgb, randHexString } from '@geomm/color'

const SIZE = vec2(500, 500)
const [canvas, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(canvas)

const eye = vec3(0, 0, 0)
const viewMat = createViewMatrix(eye)

const fovY = Math.PI / 4
const aspect = 1
const NEAR = 0.1
const FAR = 50
const perspectiveMat = createPerspectiveMatrix(fovY, aspect, NEAR, FAR)

const createModelMat = (time: number) => {
  const axis = { x: 1, y: 1, z: 0.5 }
  const angle = time
  const rotationMatrix = createAxisAngleRotationMatrix(axis, angle)
  const modelMat = matmul(translate(identity, vec3(0, 0, -8)), rotationMatrix)
  return modelMat
}

type VertexData = {
  face: Vec4[]
  normal: Vec3
  color: string
  centroid: Vec3
  clipCoords?: Vec2[]
  transformedNormal?: Vec3
  transformedCentroid?: Vec3
  lightIntensity?: number
}

const extractFaceData = (
  vertices: Float32Array,
  normals: Float32Array,
): Transducer<Uint16Array, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, groupedIndices: Uint16Array) => {
      const [p0, p1, p2] = getFace(groupedIndices, vertices)
      const v0 = vec4(p0[0], p0[1], p0[2], 1)
      const v1 = vec4(p1[0], p1[1], p1[2], 1)
      const v2 = vec4(p2[0], p2[1], p2[2], 1)

      const [n0] = getFace(groupedIndices, normals)
      const normal = vec3(n0[0], n0[1], n0[2])

      const color = randHexString()

      const centroid = centroid3(v0, v1, v2)

      const vertexData = {
        face: [v0, v1, v2],
        normal,
        color,
        centroid,
      }

      return reducer(acc, vertexData)
    }
  }
}

const transformToClipSpace = (
  mvp: Mat4,
): Transducer<VertexData, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, vertex: VertexData): R => {
      const [p0, p1, p2] = vertex.face
      const t0 = transformVec4(vec4(p0.x, p0.y, p0.z, 1), mvp)
      const t1 = transformVec4(vec4(p1.x, p1.y, p1.z, 1), mvp)
      const t2 = transformVec4(vec4(p2.x, p2.y, p2.z, 1), mvp)

      const transformedCentroid = toClipspace(
        transformVec4(
          vec4(vertex.centroid.x, vertex.centroid.y, vertex.centroid.z, 1),
          mvp,
        ),
        SIZE,
      )

      const c0 = toClipspace(t0, SIZE)
      const c1 = toClipspace(t1, SIZE)
      const c2 = toClipspace(t2, SIZE)

      const clipCoords = [c0, c1, c2]

      return reducer(acc, {
        ...vertex,
        clipCoords,
        transformedCentroid,
      })
    }
  }
}

const transformNormals = (
  normalMat: Mat4,
): Transducer<VertexData, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, vertex: VertexData): R => {
      const { normal } = vertex
      const transformedNormal = transformDirection(normal, normalMat)

      return reducer(acc, { ...vertex, transformedNormal })
    }
  }
}

const calculateLighting = (
  lightDir: Vec3,
): Transducer<VertexData, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, vertex: VertexData): R => {
      if (!vertex.transformedNormal) return reducer(acc, vertex)

      const normal = vertex.transformedNormal
      const ambientIntensity = 0.2
      const diffuseIntensity = Math.max(0, dot3(normal, lightDir))
      const intensity =
        ambientIntensity + diffuseIntensity * (1 - ambientIntensity)

      return reducer(acc, {
        ...vertex,
        lightIntensity: Math.max(0, intensity),
      })
    }
  }
}

const backfaceCulling = (
  viewDirection: Vec3,
): Transducer<VertexData, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, vertex: VertexData): R => {
      const { transformedNormal } = vertex
      if (!transformedNormal) return acc

      const normal = transformedNormal
      if (dot3(normal, viewDirection) >= 0) {
        return acc
      }
      return reducer(acc, vertex)
    }
  }
}

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  return (vertex: VertexData) => {
    const fill = `rgb(${floatToIntRgb(vertex.lightIntensity!).join(',')})`
    ctx.fillStyle = fill

    ctx.beginPath()
    ctx.moveTo(vertex.clipCoords![0].x, vertex.clipCoords![0].y)
    ctx.lineTo(vertex.clipCoords![1].x, vertex.clipCoords![1].y)
    ctx.lineTo(vertex.clipCoords![2].x, vertex.clipCoords![2].y)
    ctx.lineTo(vertex.clipCoords![0].x, vertex.clipCoords![0].y)
    ctx.stroke()
    ctx.fill()

    ctx.fillStyle = '#ff0000'
    ctx.beginPath()
    ctx.arc(
      vertex.transformedCentroid!.x,
      vertex.transformedCentroid!.y,
      1,
      0,
      2 * Math.PI,
    )
    ctx.fill()

    return vertex
  }
}

const pipeline = (modelMat: Mat4) => {
  const normalMatrix = normalMat(modelMat)
  const mvp = combineMatrices([perspectiveMat, viewMat, modelMat])
  return [
    transformToClipSpace(mvp),
    transformNormals(normalMatrix),
    backfaceCulling(vec3(0, 0, -1)),
    calculateLighting(normalize3(vec3(0, 1, 1))),
  ].reduce(composeTransducers, extractFaceData(cubeVertices, cubeNormals))
}

const byCentroid = (a: VertexData, b: VertexData) => {
  return b.transformedCentroid!.z - a.transformedCentroid!.z
}

const groupedIndices: Uint16Array[] = []
for (let i = 0; i < cubeIndices.length; i += 3) {
  const ids = cubeIndices.slice(i, i + 3)
  groupedIndices.push(new Uint16Array(ids))
}

let drawing = false

const run = (time: number) => {
  if (!ctx) return
  transduce(pipeline(createModelMat(time * 0.001)), concat, [], groupedIndices)
    .sort(byCentroid)
    .forEach(draw(ctx))

  if (drawing) requestAnimationFrame(run)
}

canvas.addEventListener('click', () => {
  drawing = !drawing
  if (drawing) requestAnimationFrame(run)
})

run(0)
