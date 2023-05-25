import {
  createTexture,
  initProgram,
  setUniforms,
  updateTexture,
  webgl2Canvas,
} from '@geomm/webgl'
import { appendEl } from '@geomm/dom'
import {
  identityMat,
  matFromTransformations,
  projectionMat,
  viewMat,
  sin,
  floor,
} from '@geomm/maths'
import { quad } from '@geomm/geometry'

const vertShader = `#version 300 es
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

const fragShader = `#version 300 es
precision mediump float;

in vec2 v_TexCoord;
uniform sampler2D u_Texture;
uniform sampler2D u_SecondTexture;

out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = texture(u_Texture, v_TexCoord);
  OUTCOLOUR = texture(u_SecondTexture, v_TexCoord);
}`

const [c, gl] = webgl2Canvas(512, 512)
appendEl(c)

const { setters } = initProgram(gl, {
  vertShader,
  fragShader,
  bufferGroup: quad,
})

gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
const redTex = createTexture(gl, {
  name: 'u_Texture',
  width: 1,
  height: 1,
  internalFormat: 'RGB8',
  format: 'RGB',
  type: 'UNSIGNED_BYTE',
  data: new Uint8ClampedArray([0, 0, 255]),
})
const blueTex = createTexture(gl, {
  name: 'u_SecondTexture',
  width: 1,
  height: 1,
  format: 'RGB',
  internalFormat: 'RGB8',
  type: 'UNSIGNED_BYTE',
  data: new Uint8ClampedArray([255, 0, 0]),
})

const uniforms = {
  u_ModelMatrix: identityMat(),
  u_ViewMatrix: viewMat(),
  u_ProjectionMatrix: projectionMat(),
  u_Texture: blueTex,
  u_SecondTexture: redTex,
}

setUniforms(setters, uniforms)

const draw = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(0.9, 0.9, 0.9, 1)

  const smallTime = time * 0.001
  const r = floor((sin(smallTime * 2) + 1) * 127) % 255

  const redData = new Uint8Array([r, 0, 0])
  const blueData = new Uint8Array([0, 0, r])
  setUniforms(setters, {
    ...uniforms,
    u_ModelMatrix: matFromTransformations({
      translation: [0.2, 0.2, -3],
      rotation: {
        axis: [0, 0.2, 1],
        angle: smallTime,
      },
      scale: [1, sin(smallTime) * 0.5 + 1, 1],
    }),
    u_Texture: updateTexture(gl, { ...redTex, data: redData }),
    u_SecondTexture: updateTexture(gl, { ...blueTex, data: blueData }),
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
