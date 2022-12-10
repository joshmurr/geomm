import {
  createVAO,
  getUniformSetters,
  quadBuffer,
  setUniforms,
  shaderProgram,
  textureLoader,
  webgl2Canvas,
} from '@geomm/webgl'
import { add } from '@geomm/dom'
import { mat4, vec3 } from 'gl-matrix'

const vert = `#version 300 es
precision mediump float;

in vec3 i_Position;
in vec2 i_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

out vec2 v_TexCoord;

void main(){
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;
}`

const frag = `#version 300 es
precision mediump float;

in vec2 v_TexCoord;
uniform sampler2D u_Texture;

out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = texture(u_Texture, v_TexCoord);
}`

const [c, gl] = webgl2Canvas(512, 512)
add(c)

const program = shaderProgram(gl, vert, frag)

/* const quadBuf = createBufferInfoForProgram(gl, quad, program) */
const quadBuf = quadBuffer(gl, program)
const quadVAO = createVAO(gl, quadBuf)

const textureFactory = textureLoader(gl)
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
const smallTex = textureFactory(2, 2, 'R8', 'RED')
const data = new Uint8Array([255, 128, 192, 0])
const tex = smallTex(data)

const viewMat = mat4.lookAt(
  mat4.create(),
  vec3.fromValues(0, 0, 2),
  vec3.fromValues(0, 1, 0),
  vec3.fromValues(0, 0, 0),
)

const defaultProjMat = (): mat4 => {
  const fieldOfView = (45 * Math.PI) / 180
  const aspect = 1
  const zNear = 0.1
  const zFar = 100.0

  return mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar)
}

const uniforms = {
  u_ModelMatrix: mat4.create(),
  u_ViewMatrix: mat4.create(),
  u_ProjectionMatrix: defaultProjMat(),
  u_Texture: tex,
}

const uniformSetters = getUniformSetters(gl, program)

gl.bindVertexArray(quadVAO)
gl.useProgram(program)
setUniforms(uniformSetters, uniforms)

const draw = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(0.9, 0.9, 0.9, 1)

  /* setUniforms(uniformSetters, uniforms) */
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
