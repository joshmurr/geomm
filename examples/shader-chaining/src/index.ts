import { appendEl } from '@geomm/dom'
import { quad } from '@geomm/geometry'
import {
  basicVert,
  createFramebuffer,
  createTexture,
  initProgram,
  simpleRender,
  webgl2Canvas,
} from '@geomm/webgl'

const programFrag = `#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform float u_Time;
out vec4 OUTCOLOUR;

void main(){
  float time = u_Time * 0.001;
  float r = gl_FragCoord.x / u_Resolution.x;
  float g = gl_FragCoord.y / u_Resolution.y;
  float b = sin(time);
  OUTCOLOUR = vec4(r, g, b, 1.0);
}`

const outputFrag = `#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform sampler2D u_Texture;
uniform float scale;
in vec2 v_TexCoord;
out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = texture(u_Texture, v_TexCoord) + vec4(scale, vec3(0.0));
}`

const programRes = { x: 16, y: 16 }
const [c, gl] = webgl2Canvas(512, 512)
appendEl(c)

const {
  program,
  vao: programQuadVAO,
  setters: programUniformSetters,
} = initProgram(gl, {
  vertShader: basicVert,
  fragShader: programFrag,
  bufferGroup: quad,
})

const {
  program: outputProgram,
  vao: outputQuadVAO,
  setters: outputUniformSetters,
} = initProgram(gl, {
  vertShader: basicVert,
  fragShader: outputFrag,
  bufferGroup: quad,
})

const renderTex = createTexture(gl, {
  name: 'u_Render',
  width: programRes.x,
  height: programRes.y,
  internalFormat: 'RGBA',
  format: 'RGBA',
  type: 'UNSIGNED_BYTE',
})

const fbo = createFramebuffer(gl, renderTex)

const programUniforms = {
  u_Resolution: [programRes.x, programRes.y],
}

const outputUniforms = {
  u_Resolution: [c.width, c.height],
  u_Texture: renderTex,
}

simpleRender(gl, true, [
  {
    vao: programQuadVAO,
    program: program,
    uniforms: programUniforms,
    setters: programUniformSetters,
    viewport: Object.values(programRes),
    fbo,
  },
  {
    vao: outputQuadVAO,
    program: outputProgram,
    uniforms: outputUniforms,
    setters: outputUniformSetters,
    viewport: [c.width, c.height],
    fbo: null,
  },
])
