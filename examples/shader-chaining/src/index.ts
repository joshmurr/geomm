import {
  basicVert,
  createFramebuffer,
  createTexture,
  initProgram,
  quadBuffer,
  simpleRender,
  webgl2Canvas,
} from '@geomm/webgl'
import { add } from '@geomm/dom'

const MOUSE = { x: 0, y: 0 }

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
add(c)

const {
  program,
  vao: programQuadVAO,
  setters: programUniformSetters,
} = initProgram(gl, {
  vertShader: basicVert,
  fragShader: programFrag,
  bufferFn: quadBuffer,
})

const {
  program: outputProgram,
  vao: outputQuadVAO,
  setters: outputUniformSetters,
} = initProgram(gl, {
  vertShader: basicVert,
  fragShader: outputFrag,
  bufferFn: quadBuffer,
})

const renderTex = createTexture(gl, {
  name: 'u_Render',
  width: programRes.x,
  height: programRes.y,
  type: 'RGBA',
  format: 'RGBA',
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
    resolution: programRes,
    fbo,
  },
  {
    vao: outputQuadVAO,
    program: outputProgram,
    uniforms: outputUniforms,
    setters: outputUniformSetters,
  },
])

c.addEventListener('mousemove', function (e) {
  const rect = this.getBoundingClientRect()
  MOUSE.x = e.clientX - rect.left
  MOUSE.y = rect.height - (e.clientY - rect.top) - 1
  //MOUSE.x /= SCALE
  //MOUSE.y /= SCALE
})
