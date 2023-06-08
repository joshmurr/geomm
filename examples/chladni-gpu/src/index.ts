import { appendEl, createEl, makeGui, Settings } from '@geomm/dom'
import {
  createBufferInfo,
  createTexture,
  createVAO,
  getUniformSetters,
  setUniforms,
  shaderProgram,
  uniformsFromSettings,
} from '@geomm/webgl'
import { hexToRgb, intRgbToFloat } from '@geomm/color'
import { hexColors } from './colors'
import seed from './images/11.png'

const c = createEl('canvas', { width: 512, height: 512 }) as HTMLCanvasElement
const gl = c.getContext('webgl2') as WebGL2RenderingContext
appendEl(c)

const settings: Settings = {
  minWalk: {
    type: 'range',
    val: 0.0002,
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
    min: 0.1,
    max: 10,
  },
  b: {
    type: 'range',
    val: 1.2,
    min: 0.1,
    max: 10,
  },
  m: {
    type: 'range',
    val: 8,
    min: 0.1,
    max: 10,
  },
  n: {
    type: 'range',
    val: 4,
    min: 0.1,
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
    val: 100,
    min: 0,
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
}

const mouse = [0, 0, 0]

makeGui(settings)

const update_vs = `#version 300 es
  in vec2 a_position;
  out vec2 v_position;

  #define PI 3.1415926535897932384626433832795
  #define aspect 1.0

  uniform float a;
  uniform float b;
  uniform float m;
  uniform float n;
  uniform float vel;
  uniform float minWalk;
  uniform float time;
  uniform sampler2D seedImg;
  uniform float chladniDisplace;
  uniform float imgDisplace;
  uniform vec3 mouse;

  float chladni(vec2 pos, float a, float b, float m, float n) {
    return a * sin(PI * n * pos.x * aspect) * sin(PI * m * pos.y) + b * sin(PI * m * pos.x * aspect) * sin(PI * n * pos.y);
  }

  float random(vec2 pos) {
    /* 0 < v < 1 */
    return fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float stoch(vec2 pos) {
    float eq = chladni(pos, a, b, m, n) * chladniDisplace;
    float displace = texture(seedImg, pos * 0.5 + vec2(0.5)).r * imgDisplace;
    float newStoch = max((vel + displace) * 0.5 * abs(eq), minWalk);

    return newStoch;
  }

  float randRange(float min, float max) {
    return random(vec2(min, max)) * (max - min) + min;
  }

  vec2 move(vec2 pos, float stochasticAmp) {
    float _x = randRange(-stochasticAmp, stochasticAmp);
    float _y = randRange(-stochasticAmp, stochasticAmp);

    vec2 newPos = pos + vec2(_x, _y);

    return newPos;
  }

  vec2 bound(vec2 pos) {
    vec2 newPos = pos;
    if(pos.x > 1.0) newPos.x = -1.0;
    if(pos.y > 1.0) newPos.y = -1.0;
    if(pos.x < -1.0) newPos.x = 1.0;
    if(pos.y < -1.0) newPos.y = 1.0;
    return newPos;
  }

  void main(){
    float stochasticAmp = stoch(a_position);
    v_position = bound(move(a_position, stochasticAmp));

    if(mouse.z > 0.5) {
      int scale = 4;
      float _x = float(gl_VertexID * scale % 512);
      float _y = floor(float(gl_VertexID * scale) / 512.0);
      v_position = vec2(_x, _y) / 512.0 * 2.0 - 1.0;
    }
  }
`
const update_fs = `#version 300 es
	precision mediump float;

	void main() {
		discard;
	}
`

const render_vs = `#version 300 es
  in vec2 a_position;

  void main(){
    gl_PointSize = 1.5;
		gl_Position = vec4(a_position, 0.0, 1.0);
  }
`
const render_fs = `#version 300 es
  precision mediump float;
  uniform vec3 particleColor;
  uniform sampler2D seedImg;
  out vec4 outcolor;

  void main(){
    /* vec2 uv = gl_FragCoord.xy / vec2(512.0, 512.0); */
    /* outcolor = texture(seedImg, uv); */
    outcolor = vec4(particleColor, 1.0);
  }
`

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

function initialParticleData(num_parts: number) {
  const data = []
  for (let i = 0; i < num_parts; ++i) {
    // position
    data.push(Math.random() * 2 - 1)
    data.push(Math.random() * 2 - 1)
  }
  return new Float32Array(data)
}

const NUM_PARTICLES = 80000
const data = initialParticleData(NUM_PARTICLES)

/**/
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

const seedImg = createTexture(gl, {
  name: 'seedImg',
  type: 'UNSIGNED_BYTE',
  format: 'RGBA',
  internalFormat: 'RGBA',
  data: seed,
})

let count = 0
function step(time: number) {
  gl.clearColor(...intRgbToFloat(hexToRgb(hexColors.pink)), 1.0)
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
    seedImg,
  })
  gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES)
  count++

  window.requestAnimationFrame(step)
}

c.addEventListener('mousedown', () => (mouse[2] = 1))
c.addEventListener('mouseup', () => (mouse[2] = 0))

window.requestAnimationFrame(step)

console.log('glError:', gl.getError())
