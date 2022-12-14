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
import {
  identityMat,
  matFromTransformations,
  projectionMat,
  viewMat,
  sin,
  floor,
} from '@geomm/maths'

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

const quadBuf = quadBuffer(gl, program)
const quadVAO = createVAO(gl, quadBuf)

gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
const textureFactory = textureLoader(gl)
const smallTex = textureFactory(2, 2, 'R8', 'RED')

const uniforms = {
  u_ModelMatrix: identityMat(),
  u_ViewMatrix: viewMat(),
  u_ProjectionMatrix: projectionMat(),
  u_Texture: smallTex(new Uint8Array([255, 128, 192, 0])),
}

const uniformSetters = getUniformSetters(gl, program)

gl.bindVertexArray(quadVAO)
gl.useProgram(program)
setUniforms(uniformSetters, uniforms)

const draw = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(0.9, 0.9, 0.9, 1)

  const smallTime = time * 0.001
  const r = floor((sin(smallTime * 2) + 1) * 127) % 255

  const data = new Uint8Array([r, 128, 192, 0])
  setUniforms(uniformSetters, {
    ...uniforms,
    u_ModelMatrix: matFromTransformations({
      translation: [0.2, 0.2, -3],
      rotation: {
        axis: [0, 0.2, 1],
        angle: smallTime,
      },
      scale: [1, sin(smallTime) * 0.5 + 1, 1],
    }),

    u_Texture: smallTex(data),
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
