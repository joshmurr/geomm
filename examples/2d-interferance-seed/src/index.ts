import { appendEl, canvas } from '@geomm/dom'
import {
  basicVert,
  createFramebuffer,
  createTexture,
  initProgram,
  pingPong,
  webgl2Canvas,
} from '@geomm/webgl'
import {
  displayArrayValuesInTable,
  hexColors,
  hexToRgb,
  intRgbToFloat,
} from './colors'
import { applyKernel, blurKernel, float32ArrayToImage } from './image'
import seed from './images/09.png'
import { sdfSquare, smoothstep } from './sdf'
import { programFrag, outputFrag } from './shaders'
import { indexedQuad } from '@geomm/geometry'

const SIZE = 256
const RES = { width: SIZE, height: SIZE }
const SCREEN = { width: SIZE, height: SIZE }
const [c, gl] = webgl2Canvas(SCREEN.width, SCREEN.height)
appendEl(c)

const tmpCanvas = canvas(SCREEN.width, SCREEN.height)
appendEl(tmpCanvas)

const ext = gl.getExtension('EXT_color_buffer_float')
if (!ext) {
  alert('need EXT_color_buffer_float')
}

const n = RES.width
const n1 = n - 1
const h = 1 / n1

const generateSeedImage = (
  sdFn: (args: unknown) => number,
  ...args: number[]
) => {
  let t = 0
  const pix = new Float32Array(4 * n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = h * (j - n / 2)
      const y = h * (i - n / 2)
      /* const e = 50 * Math.exp(-5000 * (x * x + y * y)) */
      const d = sdFn(x, y, ...args)
      const e = 1.0 - smoothstep(0.0, 0.05, Math.abs(d))
      pix[t++] = e
      pix[t++] = 0
      pix[t++] = 0
      pix[t++] = 0
    }
  }

  return { pix }
}

const seedImage = appendEl('img') as HTMLImageElement
seedImage.src = seed

seedImage.onload = () => {
  /* const { pix } = generateSeedImage(sdfCircle, 0, 0, 0.2) */
  const { pix } = generateSeedImage(sdfSquare, 0, 0, 0.2)
  /* const { pix, min, max } = imageToFloat32Array(seedImage, RES) */
  const manipulatedImg = applyKernel(blurKernel, pix, RES)
  const usedImg = manipulatedImg

  float32ArrayToImage(usedImg, tmpCanvas, RES)
  displayArrayValuesInTable(usedImg, RES.width * 4, RES.height, 0, 0.95)

  /* gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1) */
  const textures = [...Array(3)].map((_, i) =>
    createTexture(gl, {
      name: `u_Tex${i}`,
      width: RES.width,
      height: RES.height,
      internalFormat: 'RGBA16F',
      format: 'RGBA',
      type: 'FLOAT',
      data: usedImg,
    }),
  )

  const fbos = [...Array(3)].map((_, i) => createFramebuffer(gl, textures[i]))

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
    alert(
      'Your browser does not support ' +
        'FLOAT as the color attachment to an FBO',
    )
  }

  const compute1 = {
    ...initProgram(gl, {
      vertShader: basicVert,
      fragShader: programFrag,
      bufferGroup: indexedQuad,
    }),
    uniforms: {
      u_samp: textures[0],
      u_samp1: textures[1],
    },
    viewport: [RES.width, RES.height],
    fbo: fbos[2],
  }
  const compute2 = {
    ...initProgram(gl, {
      vertShader: basicVert,
      fragShader: programFrag,
      bufferGroup: indexedQuad,
    }),
    uniforms: {
      u_samp: textures[1],
      u_samp1: textures[2],
    },
    viewport: [RES.width, RES.height],
    fbo: fbos[0],
  }
  const compute3 = {
    ...initProgram(gl, {
      vertShader: basicVert,
      fragShader: programFrag,
      bufferGroup: indexedQuad,
    }),
    uniforms: {
      u_samp: textures[2],
      u_samp1: textures[0],
    },
    viewport: [RES.width, RES.height],
    fbo: fbos[1],
  }

  const outputProgramDesc = {
    ...initProgram(gl, {
      vertShader: basicVert,
      fragShader: outputFrag,
      bufferGroup: indexedQuad,
    }),
    uniforms: {
      u_samp: textures[0],
      u_colA: intRgbToFloat(hexToRgb(hexColors.red)),
      u_colB: intRgbToFloat(hexToRgb(hexColors.pink)),
    },
    viewport: [SCREEN.width, SCREEN.height],
  }

  const frameDelay = Math.floor(1000 / 60)
  pingPong(
    gl,
    [compute1, compute2, compute3],
    outputProgramDesc,
    true,
    frameDelay,
  )
}
