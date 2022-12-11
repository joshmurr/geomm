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
  rotateAngleAxis3D,
  translate3D,
  viewMat,
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

/* const quadBuf = createBufferInfoForProgram(gl, quad, program) */
const quadBuf = quadBuffer(gl, program)
const quadVAO = createVAO(gl, quadBuf)

const textureFactory = textureLoader(gl)
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
const smallTex = textureFactory(2, 2, 'R8', 'RED')
const data = new Uint8Array([255, 128, 192, 0])
const tex = smallTex(data)

/* const modelM = identityMat() */
const modelM = matFromTransformations({
  translation: [0.2, 0.2, -3],
  rotation: {
    axis: [0, 0.2, 1],
    angle: 45,
  },
  scale: [1, 1, 1],
})
const viewM = viewMat()
const projM = projectionMat()

/* const transModelM = translate3D(modelM, [0, 0, -5]) */
/* const rotModelM = rotateAngleAxis3D(transModelM, 45, [0, 1, 0]) */

const uniforms = {
  u_ModelMatrix: modelM,
  u_ViewMatrix: viewM,
  u_ProjectionMatrix: projM,
  u_Texture: tex,
}

const uniformSetters = getUniformSetters(gl, program)

gl.bindVertexArray(quadVAO)
gl.useProgram(program)
setUniforms(uniformSetters, uniforms)

const draw = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(0.9, 0.9, 0.9, 1)

  const smallTime = time * 0.001
  const r = Math.round((Math.sin(smallTime * 2) + 1) * 127) % 255

  const data = new Uint8Array([r, 128, 192, 0])
  setUniforms(uniformSetters, {
    ...uniforms,
    u_ModelMatrix: matFromTransformations({
      translation: [0.2, 0.2, -3],
      rotation: {
        axis: [0, 0.2, 1],
        angle: smallTime,
      },
      scale: [1, Math.sin(smallTime) * 0.5 + 1, 1],
    }),

    u_Texture: smallTex(data),
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
