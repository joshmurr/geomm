import { appendEl } from '@geomm/dom'
import {
  createBufferInfo,
  createVAO,
  shaderProgram,
  webgl2Canvas,
} from '@geomm/webgl'

const [c, gl] = webgl2Canvas(512, 512)
appendEl(c)

const update_vs = `#version 300 es
  in vec2 a_position;
  in vec2 a_velocity;

  out vec2 v_position;
  out vec2 v_velocity;

  void main(){
    v_position = a_position + a_velocity;
		vec2 multiplier = vec2(1.0);
		if(v_position.x > 1.0) multiplier.x *= -1.0;
		if(v_position.y > 1.0) multiplier.y *= -1.0;
		if(v_position.x < -1.0) multiplier.x *= -1.0;
		if(v_position.y < -1.0) multiplier.y *= -1.0;
    v_velocity = a_velocity * multiplier;
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
    gl_PointSize = 3.0;
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

const transformFeedbackAttribs = ['a_position', 'a_velocity']
const transformFeedbackVaryings = ['v_position', 'v_velocity']
const update = shaderProgram(gl, {
  vertShader: update_vs,
  fragShader: update_fs,
  transformFeedbackVaryings,
})
const render = shaderProgram(gl, {
  vertShader: render_vs,
  fragShader: render_fs,
})

function initialParticleData(num_parts: number) {
  const data = []
  for (let i = 0; i < num_parts; ++i) {
    // position
    data.push(Math.random() - 0.5)
    data.push(Math.random() - 0.5)
    // velocity
    data.push((Math.random() - 0.5) * 0.01)
    data.push((Math.random() - 0.5) * 0.01)
  }
  return new Float32Array(data)
}

const NUM_PARTICLES = 1000
const data = initialParticleData(NUM_PARTICLES)

const buffers = [
  gl.createBuffer() as WebGLBuffer,
  gl.createBuffer() as WebGLBuffer,
]

// gl.FLOAT = 32 bit = 4 byte
const FLOAT_SIZE = 4

const updateBuffers = buffers.map((buf) =>
  createBufferInfo(
    gl,
    {
      data,
      buffer: buf,
      usage: gl.STREAM_DRAW,
      attributes: transformFeedbackAttribs.map((name, j) => {
        const numComponents = 2
        const stride =
          FLOAT_SIZE * (numComponents * transformFeedbackAttribs.length)
        const offset = j * numComponents * FLOAT_SIZE

        return {
          name,
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
          stride: FLOAT_SIZE * (2 * transformFeedbackAttribs.length),
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
