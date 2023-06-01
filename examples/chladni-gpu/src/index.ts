import { appendEl, createEl } from '@geomm/dom'
import { createBufferInfo, createVAO, shaderProgram } from '@geomm/webgl'

const c = createEl('canvas', { width: 512, height: 512 }) as HTMLCanvasElement
const gl = c.getContext('webgl2') as WebGL2RenderingContext
appendEl(c)

const update_vs = `#version 300 es
  in vec2 a_position;
  out vec2 v_position;

  #define PI 3.1415926535897932384626433832795
  #define aspect 1.0

  const float a = 2.0;
  const float b = 1.2;
  const float m = 8.0;
  const float n = 4.0;
  const float vel = 0.02;
  const float minWalk = 0.001;

  float chladni(vec2 pos, float a, float b, float m, float n) {
    return a * sin(PI * n * pos.x * aspect) * sin(PI * m * pos.y) + b * sin(PI * m * pos.x * aspect) * sin(PI * n * pos.y);
  }

  float random(vec2 pos) {
    /* 0 < v < 1 */
    return fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float stoch(vec2 pos) {
    float eq = chladni(pos, a, b, m, n);
    float newStoch = max(vel * abs(eq), minWalk);

    return newStoch;
  }

  float randRange(float min, float max) {
    return random(vec2(min, max)) * (max - min) + min;
  }

  vec2 move(vec2 pos, float stochasticAmp) {
    float r = random(pos);
    vec2 newPos = pos + vec2(randRange(-stochasticAmp, stochasticAmp), randRange(stochasticAmp, -stochasticAmp));

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
    gl_PointSize = 1.0;
		gl_Position = vec4(a_position, 0.0, 1.0);
  }
`
const render_fs = `#version 300 es
  precision mediump float;
  out vec4 outcolor;

  void main(){
    outcolor = vec4(vec3(0.0), 1.0);
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

const NUM_PARTICLES = 10000
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
function step() {
  gl.clearColor(0.8, 0.8, 0.8, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(update)
  gl.bindVertexArray(state[count % 2].update)
  /* Bind the "write" buffer as transform feedback - the varyings of the
     update shader will be written here. */
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[++count % 2])

  /* Since we're not actually rendering anything when updating the particle
     state, disable rasterization.*/
  gl.enable(gl.RASTERIZER_DISCARD)

  /* Begin transform feedback! */
  gl.beginTransformFeedback(gl.POINTS)
  gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES) /*** !!!! ***/
  gl.endTransformFeedback()
  gl.disable(gl.RASTERIZER_DISCARD)
  /* Don't forget to unbind the transform feedback buffer! */
  gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)

  /* Now, we draw the particle system. Note that we're actually
     drawing the data from the "read" buffer, not the "write" buffer
     that we've written the updated data to. */

  gl.bindVertexArray(state[++count % 2].render)
  gl.useProgram(render)
  gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES)
  count++

  window.requestAnimationFrame(step)
}

step()

console.log('glError:', gl.getError())
