import {
  createFramebuffer,
  initProgram,
  quadBuffer,
  simpleRender,
  textureLoader,
  webgl2Canvas,
} from '@geomm/webgl'
import { add } from '@geomm/dom'

const vert = `#version 300 es
precision mediump float;

in vec3 i_Position;
in vec2 i_TexCoord;

out vec2 v_TexCoord;

void main(){
  gl_Position = vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;
}`

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
in vec2 v_TexCoord;
out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = texture(u_Texture, v_TexCoord);
}`

const programRes = { x: 16, y: 16 }
const [c, gl] = webgl2Canvas(512, 512)
add(c)

const {
  program,
  vao: programQuadVAO,
  uniformSetters: programUniformSetters,
} = initProgram(gl, {
  vertShader: vert,
  fragShader: programFrag,
  bufferFn: quadBuffer,
})

const {
  program: outputProgram,
  vao: outputQuadVAO,
  uniformSetters: outputUniformSetters,
} = initProgram(gl, {
  vertShader: vert,
  fragShader: outputFrag,
  bufferFn: quadBuffer,
})

const textureFactory = textureLoader(gl)(
  programRes.x,
  programRes.y,
  'RGBA',
  'RGBA',
)
const renderTex = textureFactory(null) as WebGLTexture

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
