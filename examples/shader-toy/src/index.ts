import {
  simpleRender,
  setUniforms,
  webgl2Canvas,
  initProgram,
} from '@geomm/webgl'
import { appendEl } from '@geomm/dom'
import { quad } from '@geomm/geometry'

const vertShader = `#version 300 es
precision mediump float;

in vec3 i_Position;

void main(){
  gl_Position = vec4(i_Position, 1.0);
}`

const fragShader = `#version 300 es
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
appendEl(c)

const { program, vao, setters } = initProgram(gl, {
  vertShader,
  fragShader,
  bufferGroup: quad,
})
const uniforms = {
  u_Resolution: [c.width, c.height],
}
setUniforms(setters, uniforms)

simpleRender(gl, false, [
  {
    vao: vao,
    program,
    uniforms: uniforms,
    setters,
  },
])
