import { add } from '@geomm/dom'
import {
  basicVert,
  createFramebuffer,
  createTexture,
  initProgram,
  pingPong,
  quadBuffer,
  webgl2Canvas,
} from '@geomm/webgl'
import {
  displayArrayValuesInTable,
  hexColors,
  hexToRgb,
  intRgbToFloat,
} from './colors'
import seed from './images/09.png'

const SIZE = 256
const RES = { width: SIZE, height: SIZE }
const SCREEN = { width: SIZE, height: SIZE }
const [c, gl] = webgl2Canvas(SCREEN.width, SCREEN.height)
add(c)

const ext = gl.getExtension('EXT_color_buffer_float')
if (!ext) {
  alert('need EXT_color_buffer_float')
}

const programFrag = `#version 300 es
precision highp float;
uniform sampler2D u_samp;
uniform sampler2D u_samp1;
in vec2 v_TexCoord;

const float d = 1./${RES.width}., dth2 = .2;

out vec4 OUTCOLOUR;

void main() {
  float u = texture(u_samp, v_TexCoord).r;
  float u1  = texture(u_samp1, v_TexCoord).r;
  u = 2.*u1 - u +
    (texture(u_samp1, vec2(v_TexCoord.x, v_TexCoord.y + d) ).r +
     texture(u_samp1, vec2(v_TexCoord.x, v_TexCoord.y - d) ).r +
     texture(u_samp1, vec2(v_TexCoord.x + d, v_TexCoord.y) ).r +
     texture(u_samp1, vec2(v_TexCoord.x - d, v_TexCoord.y) ).r +
     - 4.*u1)*dth2;

  OUTCOLOUR = vec4(u, 0., 0., 0. );
}
`

const outputFrag = `#version 300 es
precision highp float;
uniform sampler2D u_samp;
uniform vec3 u_colA;
uniform vec3 u_colB;
in vec2 v_TexCoord;

out vec4 OUTCOLOUR;

void main() {
  float c = texture(u_samp, v_TexCoord).r;
  /* if (c < 0.) OUTCOLOUR = vec4(0., 0., -c, 1.); */
  /* else OUTCOLOUR = vec4(c, 0., 0., 1.); */

  if (c < 0.) OUTCOLOUR = vec4(u_colA, 1.);
  else OUTCOLOUR = vec4(u_colB, 1.);
}
`

const n = RES.width
const n1 = n - 1
const h = 1 / n1

const closeEnough = (a: number, b: number) => Math.abs(a - b) < 0.00001

const generateSeedImage = () => {
  let t = 0
  let min = Infinity
  let max = -Infinity
  const pix = new Float32Array(4 * n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = h * (j - n / 2)
      const y = h * (i - n / 2)
      const e = 50 * Math.exp(-5000 * (x * x + y * y))
      if (e < min) min = e
      if (e > max) max = e
      pix[t++] = e
      pix[t++] = 0
      pix[t++] = 0
      pix[t++] = 0
    }
  }

  return { pix, min, max }
}

const seedImage = add('img') as HTMLImageElement
seedImage.src = seed

const imageToFloat32Array = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no ctx')
  ctx.drawImage(image, 0, 0, RES.width, RES.height)
  const data = ctx.getImageData(0, 0, RES.width, RES.height).data
  const pix = new Float32Array(data.length)
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < data.length; i += 4) {
    const pNorm = data[i] / 255
    const e = 1 - Math.exp(-1 * pNorm)
    if (e < min) min = e
    if (e > max) max = e
    pix[i] = e < 0.55 ? 0 : e
    pix[i + 1] = 0
    pix[i + 2] = 0
    pix[i + 3] = 0
  }
  return { pix, min, max }
}

seedImage.onload = () => {
  const { pix, min, max } = imageToFloat32Array(seedImage)
  /* console.log('min', min, 'max', max) */
  /* const { pix, min, max } = generateSeedImage() */
  displayArrayValuesInTable(pix, RES.width * 4, RES.height, 0, 0.95)

  /* gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1) */
  const textures = [...Array(3)].map((_, i) =>
    createTexture(gl, {
      name: `u_Tex${i}`,
      width: RES.width,
      height: RES.height,
      internalFormat: 'RGBA16F',
      format: 'RGBA',
      type: 'FLOAT',
      data: pix,
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
      bufferFn: quadBuffer,
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
      bufferFn: quadBuffer,
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
      bufferFn: quadBuffer,
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
      bufferFn: quadBuffer,
    }),
    uniforms: {
      u_samp: textures[0],
      u_colA: intRgbToFloat(hexToRgb(hexColors.red)),
      u_colB: intRgbToFloat(hexToRgb(hexColors.pink)),
    },
    viewport: [SCREEN.width, SCREEN.height],
  }

  pingPong(gl, [compute1, compute2, compute3], outputProgramDesc, true, 50)
}
