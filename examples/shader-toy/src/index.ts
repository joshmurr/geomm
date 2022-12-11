import {
  createVAO,
  getUniformSetters,
  quadBuffer,
  setUniforms,
  shaderProgram,
  webgl2Canvas,
} from '@geomm/webgl'
import { add } from '@geomm/dom'

const vert = `#version 300 es
precision mediump float;

in vec3 i_Position;

void main(){
  gl_Position = vec4(i_Position, 1.0);
}`

const frag = `#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform float u_Time;
out vec4 OUTCOLOUR;

void main(){
    float r = gl_FragCoord.x / u_Resolution.x;
    float g = gl_FragCoord.y / u_Resolution.y;
    float b = sin(u_Time);
    OUTCOLOUR = vec4(r, g, b, 1.0);
}`

const [c, gl] = webgl2Canvas(512, 512)
add(c)

const program = shaderProgram(gl, vert, frag)

const quadBuf = quadBuffer(gl, program)
const quadVAO = createVAO(gl, quadBuf)

const uniforms = {
  u_Resolution: [c.width, c.height],
}

const uniformSetters = getUniformSetters(gl, program)

gl.bindVertexArray(quadVAO)
gl.useProgram(program)
setUniforms(uniformSetters, uniforms)

const draw = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(0.9, 0.9, 0.9, 1)

  setUniforms(uniformSetters, {
    ...uniforms,
    u_Time: time * 0.001,
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
