import {
  composeTransducers,
  concat,
  filtering,
  mapping,
  Reducer,
  transduce,
  Transducer,
} from '@geomm/core'
import {
  add,
  createPerspectiveMatrix,
  createViewMatrix,
  identity,
  mag,
  matmul,
  rotateX,
  transformVec4,
  translate,
  vec2,
  vec3,
  vec4,
} from '@geomm/maths'
import type { Mat4, Vec2, Vec4 } from '@geomm/api'
import { indexedCube } from '@geomm/geometry'

// input data
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// transformations
const addRandom = (x: number) => x + Math.floor(Math.random() * 10)
const doubleIt = (x: number) => x * 2

// predicates
const isEven = (x: number) => x % 2 === 0

const filterEven = filtering<number, number[]>(isEven)
const addRand = mapping<number, number, number[]>(addRandom)
const doubler = mapping<number, number, number[]>(doubleIt)
const xform = composeTransducers(
  composeTransducers(addRand, doubler),
  filterEven,
)
const transduceResult = transduce(xform, concat, [], nums)
console.log('transduceResult', transduceResult)

const vectors = [vec2(2, 3), vec2(-3, 8), vec2(4, 16)]

const length = mapping<Vec2, number, number[]>(mag)
const longerThan10 = filtering<number, number[]>((l: number) => l > 10)
const transLongerThan10 = transduce(
  composeTransducers(length, longerThan10),
  concat,
  [],
  vectors,
)
console.log('transLongerThan10', transLongerThan10)

const transAdd = transduce(
  (rf) => (v1: Vec2, v2: Vec2) => rf(v1, v2), // transducer
  add,
  vec2(0, 0),
  vectors,
)
console.log('transAdd', transAdd)

const eye = vec3(0, 0, 0)
const target = vec3(0, 0, -1)
const up = vec3(0, 1, 0)

const viewMat = createViewMatrix(eye, target, up)

const fovY = Math.PI / 4
const aspect = 1
const near = 0.1
const far = 50
const perspectiveMat = createPerspectiveMatrix(fovY, aspect, near, far)

const combineMatrices = (matrices: Mat4[]): Mat4 =>
  transduce(
    (rf: Reducer<Mat4, Mat4>) => (m1: Mat4, m2: Mat4) => rf(m1, m2),
    matmul,
    identity,
    matrices,
  )

const createMvp = (time: number) => {
  const modelMat = rotateX(translate(identity, vec3(0, 0, -5)), time)
  return combineMatrices([perspectiveMat, viewMat, modelMat])
}

type VertexData = {
  face: Vec4[]
  clipCoords?: Vec2[]
  colour?: [number, number, number]
}

const toClipspace = (v: Vec4) => {
  const invW = 1.0 / v.w
  const pixelX = (v.x * invW * 0.5 + 0.5) * 500
  const pixelY = (v.y * invW * -0.5 + 0.5) * 500
  return vec2(Math.floor(pixelX), Math.floor(pixelY))
}

const transformToClipSpace = (
  mvp: Mat4,
): Transducer<VertexData, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, vertex: VertexData) => {
      const [p0, p1, p2] = vertex.face
      const t0 = transformVec4(vec4(p0.x, p0.y, p0.z, 1), mvp)
      const t1 = transformVec4(vec4(p1.x, p1.y, p1.z, 1), mvp)
      const t2 = transformVec4(vec4(p2.x, p2.y, p2.z, 1), mvp)

      const c0 = toClipspace(t0)
      const c1 = toClipspace(t1)
      const c2 = toClipspace(t2)

      const clipCoords = [c0, c1, c2]

      return reducer(acc, { ...vertex, clipCoords })
    }
  }
}

const assignColour = (): Transducer<VertexData, VertexData, VertexData[]> => {
  return <R>(reducer: Reducer<VertexData, R>) => {
    return (acc: R, vertex: VertexData) => {
      const R = Math.floor(Math.random() * 255)
      const G = Math.floor(Math.random() * 255)
      const B = Math.floor(Math.random() * 255)

      return reducer(acc, {
        ...vertex,
        colour: [R, G, B],
      })
    }
  }
}

const draw = (
  ctx: CanvasRenderingContext2D,
): Reducer<VertexData, VertexData[]> => {
  ctx.clearRect(0, 0, 500, 500)

  return (acc: VertexData[], vertex: VertexData) => {
    const [r, g, b] = vertex.colour!

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

    ctx.beginPath()
    ctx.moveTo(vertex.clipCoords![0].x, vertex.clipCoords![0].y)
    ctx.lineTo(vertex.clipCoords![1].x, vertex.clipCoords![1].y)
    ctx.lineTo(vertex.clipCoords![2].x, vertex.clipCoords![2].y)
    ctx.lineTo(vertex.clipCoords![0].x, vertex.clipCoords![0].y)
    ctx.stroke()
    ctx.fill()

    return [...acc, vertex]
  }
}

const pipeline = (mat: Mat4) =>
  composeTransducers(transformToClipSpace(mat), assignColour())

/* Group into 3s */
const positions = indexedCube.buffers.find(
  (x) => x.attributes[0].name === 'i_Position',
)?.data as Float32Array

const initialData: VertexData[] = []

for (let i = 0; i < positions.length; i += 9) {
  const p0 = positions.slice(i, i + 3)
  const p1 = positions.slice(i + 3, i + 6)
  const p2 = positions.slice(i + 6, i + 9)
  const v0 = vec4(p0[0], p0[1], p0[2], 1)
  const v1 = vec4(p1[0], p1[1], p1[2], 1)
  const v2 = vec4(p2[0], p2[1], p2[2], 1)
  initialData.push({
    face: [v0, v1, v2],
  })
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')

const run = (time: number) => {
  if (!ctx) return
  transduce(pipeline(createMvp(time * 0.001)), draw(ctx), [], initialData)
  // requestAnimationFrame(run)
}

run(0)
