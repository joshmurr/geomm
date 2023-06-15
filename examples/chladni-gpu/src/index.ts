import {
  appendEl,
  createEl,
  getEl,
  makeGui,
  Settings,
  updateGuiValues,
} from '@geomm/dom'
import {
  createBufferInfo,
  createTexture,
  createVAO,
  getUniformSetters,
  setUniforms,
  shaderProgram,
  uniformsFromSettings,
  updateTexture,
} from '@geomm/webgl'
import { hexToRgb, intRgbToFloat } from '@geomm/color'
import { makeGaussian } from '@geomm/maths'
import { hexColors } from './colors'
import seed from './images/14.png'
import { render_fs, render_vs, update_fs, update_vs } from './shaders'

const c = createEl('canvas', { width: 512, height: 512 }) as HTMLCanvasElement
const gl = c.getContext('webgl2') as WebGL2RenderingContext
appendEl(c)

const seedImg = createTexture(gl, {
  name: 'seedImg',
  type: 'UNSIGNED_BYTE',
  format: 'RGBA',
  internalFormat: 'RGBA',
  data: seed,
})

const backplateImg = createTexture(gl, {
  name: 'backplateImg',
  type: 'UNSIGNED_BYTE',
  format: 'RGBA',
  internalFormat: 'RGBA',
  data: null,
})

const handleFileLoad = (files: FileList | null, onload: (e) => void | null) => {
  if (files) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = onload
    reader.readAsDataURL(file)
  }
}

const settings: Settings = {
  minWalk: {
    type: 'range',
    val: 0.00076,
    min: 0,
    max: 100,
    scale: 0.0001,
  },
  A: {
    type: 'range',
    val: 2.9,
    min: 0.0001,
    max: 3.0,
  },
  a: {
    type: 'range',
    val: 2,
    min: -10,
    max: 10,
  },
  b: {
    type: 'range',
    val: 4.2,
    min: -10,
    max: 10,
  },
  m: {
    type: 'range',
    val: 6,
    min: -10,
    max: 10,
  },
  n: {
    type: 'range',
    val: 4,
    min: -10,
    max: 10,
  },
  vel: {
    type: 'range',
    val: 0.0002,
    min: 0,
    max: 100,
    scale: 0.0001,
  },
  chladniDisplace: {
    type: 'range',
    val: 0.0,
    min: 1,
    max: 200,
    scale: 0.01,
  },
  imgDisplace: {
    type: 'range',
    val: 0.0,
    min: 0,
    max: 1000,
    scale: 0.001,
  },
  displacementImg: {
    type: 'file',
    callback: (files: FileList | null) =>
      handleFileLoad(files, (e) => {
        /* const img = getEl('#seed-img') as HTMLImageElement */
        const img = new Image()
        img.onload = () => {
          updateTexture(gl, { ...seedImg, data: img.src })
        }
        img.src = e.target?.result as string
      }),
  },
  backplateImg: {
    type: 'file',
    callback: (files: FileList | null) => {
      handleFileLoad(files, (e) => {
        const img = getEl('#backplate-img') as HTMLImageElement
        img.onload = () => {
          img.classList.remove('hidden')
        }
        img.src = e.target?.result as string
      })
    },
  },
  maskImg: {
    type: 'file',
    callback: (files: FileList | null) => {
      handleFileLoad(files, (e) => {
        const el = getEl('.viewer') as HTMLDivElement
        const img = new Image()
        img.onload = () => {
          el.style.maskImage = `url(${img.src})`
          console.log(img.src)
        }
        img.src = e.target?.result as string
      })
    },
  },
  positionalDisplaceScale: {
    type: 'range',
    val: 0,
    min: 0,
    max: 5,
  },
}

const mouse = [0, 0, 0]

const gui = makeGui(settings)
gui.classList.add('gui')
appendEl(gui)

const attribs = ['position']
const update = shaderProgram(gl, {
  vertShader: update_vs,
  fragShader: update_fs,
  transformFeedbackVaryings: attribs.map((name) => `v_${name}`),
})
const render = shaderProgram(gl, {
  vertShader: render_vs,
  fragShader: render_fs,
})

const gaussian = makeGaussian(
  c.width / 2,
  c.width,
  c.height,
  c.width / 2,
  c.height / 2,
)

function initialParticleData(num_parts: number) {
  const data = []
  for (let i = 0; i < num_parts; ++i) {
    /* const x = i % c.width // % is the "modulo operator", the remainder of i / width; */
    /* const y = Math.floor(i / c.width) */

    /* const dist = gaussian(x, y) */
    const dist = 0.3
    const xp = Math.cos(Math.random() * Math.PI * 2) * dist
    const yp = Math.sin(Math.random() * Math.PI * 2) * dist

    data.push(xp, yp)
  }
  return new Float32Array(data)
}

const NUM_PARTICLES = 100000
const data = initialParticleData(NUM_PARTICLES)

const buffers = [
  gl.createBuffer() as WebGLBuffer,
  gl.createBuffer() as WebGLBuffer,
]

const FLOAT_SIZE = 4
const updateBuffers = buffers.map((buf) =>
  createBufferInfo(
    gl,
    {
      data,
      buffer: buf,
      usage: gl.STREAM_DRAW,
      attributes: attribs.map((name, j) => {
        const numComponents = name === 'position' ? 2 : 1
        const stride = FLOAT_SIZE * 2
        const offset = j * 2 * FLOAT_SIZE

        return {
          name: `a_${name}`,
          numComponents,
          stride,
          offset,
        }
      }),
    },
    update,
  ),
)

const renderBuffers = buffers.map((buf) =>
  createBufferInfo(
    gl,
    {
      data,
      buffer: buf,
      usage: gl.STREAM_DRAW,
      attributes: [
        {
          name: 'a_position',
          numComponents: 2,
          stride: FLOAT_SIZE * 2,
          offset: 0,
        },
      ],
    },
    render,
  ),
)

const updateVAOs = Array.from({ length: 2 }, (_, i) =>
  createVAO(gl, [updateBuffers[i]]),
)
const renderVAOs = Array.from({ length: 2 }, (_, i) =>
  createVAO(gl, [renderBuffers[i]]),
)

const updateUniformSetters = getUniformSetters(gl, update)
const renderUniformSetters = getUniformSetters(gl, render)

const state = [
  {
    update: updateVAOs[0],
    render: renderVAOs[0],
  },
  {
    update: updateVAOs[1],
    render: renderVAOs[1],
  },
]

let count = 0
function step(time: number) {
  /* gl.clearColor(...intRgbToFloat(hexToRgb(hexColors.pink)), 1.0) */
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(update)
  gl.bindVertexArray(state[count % 2].update)
  /* Set uniforms */
  setUniforms(updateUniformSetters, {
    ...uniformsFromSettings(settings),
    time: time,
    seedImg,
    mouse,
  })
  /* Bind the "write" buffer as transform feedback - the varyings of the
     update shader will be written here. */
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[++count % 2])

  /* Since we're not actually rendering anything when updating the particle
     state, disable rasterization.*/
  gl.enable(gl.RASTERIZER_DISCARD)

  /* Begin transform feedback! */
  gl.beginTransformFeedback(gl.POINTS)

  gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES)
  gl.endTransformFeedback()
  gl.disable(gl.RASTERIZER_DISCARD)
  /* Don't forget to unbind the transform feedback buffer! */
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)

  /* Now, we draw the particle system. Note that we're actually
     drawing the data from the "read" buffer, not the "write" buffer
     that we've written the updated data to. */

  gl.bindVertexArray(state[++count % 2].render)
  gl.useProgram(render)
  setUniforms(renderUniformSetters, {
    particleColor: intRgbToFloat(hexToRgb(hexColors.red)),
    backplateImg,
  })
  gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES)
  count++

  window.requestAnimationFrame(step)
}

c.addEventListener('mousedown', () => (mouse[2] = 1))
c.addEventListener('mouseup', () => (mouse[2] = 0))
c.addEventListener('mouseover', (e: MouseEvent) => {
  settings.chladniDisplace.val = 0.1
  settings.imgDisplace.val = 0.5
})
c.addEventListener('mousemove', (e: MouseEvent) => {
  const scaledMouseX = e.clientX / c.width
  const scaledMouseY = e.clientY / c.height

  settings.a.val = scaledMouseX * 10
  settings.b.val = 1 - scaledMouseX * 10
  settings.m.val = scaledMouseY * 10
  settings.n.val = 1 - scaledMouseY * 10

  updateGuiValues(settings, gui)
})

window.requestAnimationFrame(step)

console.log('glError:', gl.getError())
