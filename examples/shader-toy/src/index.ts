import {
  createVAO,
  getUniformSetters,
  quadBuffer,
  simpleRender,
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

simpleRender(gl, false, [
  {
    vao: quadVAO,
    program: program,
    uniforms: uniforms,
    setters: uniformSetters,
  },
])
