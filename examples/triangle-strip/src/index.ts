import {
  createTexture,
  initProgram,
  setUniforms,
  webgl2Canvas,
} from '@geomm/webgl'
import {
  cos,
  identityMat,
  matFromTransformations,
  normalMatFromModel,
  projectionMat,
  sin,
  viewMat,
} from '@geomm/maths'
import { appendEl, canvas2d, labelVertices } from '@geomm/dom'
import { combineMatrices, partial, transduce } from '@geomm/core'
import { computeFaceNormals } from '@geomm/geometry'

const vertShader = `#version 300 es
precision mediump float;

in vec3 i_Position;
in vec3 i_Normal;
in vec2 i_TexCoord;
in vec4 i_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
uniform float u_Time;

out vec2 v_TexCoord;
out vec3 v_Lighting;
out vec4 v_Normal;
out vec4 v_Color;

void main(){
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;

  float t = u_Time * 0.001;

  /* gl_Position.y += sin(float(gl_VertexID - (gl_VertexID % 2)) * 0.5 * sin(t)) * 0.5; */

  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  vec3 directionalLightColor = vec3(1, 1, 1);
  vec3 directionalVector = normalize(vec3(0.85, 0.8, 2.0));

  vec4 transformedNormal = u_NormalMatrix * vec4(i_Normal, 1.0);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  v_Lighting = ambientLight + (directionalLightColor * directional);
  v_Normal = transformedNormal;
  v_Color = i_Color;
}`

const fragShader = `#version 300 es
precision mediump float;

in vec2 v_TexCoord;
in vec3 v_Lighting;
in vec4 v_Normal;
in vec4 v_Color;

uniform sampler2D u_Texture;

out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = texture(u_Texture, v_TexCoord);
}`

const count = 64
const clearColor = [0.2, 0.2, 0.4, 1] as const

const [c, gl] = webgl2Canvas(512, 512)
appendEl(c)
const [textCanvas, ctx] = canvas2d(count * 20, 100)
appendEl(textCanvas)

ctx.fillStyle = `rgba(${clearColor.map((c) => c * 255).join(', ')})`
ctx.fillRect(0, 0, textCanvas.width, textCanvas.height)
ctx.fillStyle = 'black'
ctx.font = 'bold 50px monospace'
ctx.translate(textCanvas.width, 0)
ctx.scale(-1, 1)
ctx.fillText('hello hello hello hello hello hello hello ', 10, 65)

const rad = 3
const positions = Array.from({ length: count }, (_, i) => {
  const ii = i - (i % 2) - 1
  const t = Math.PI * 2 * (ii / (count - 2))
  const x = Math.cos(t) * rad
  /* const x = ((ii / count) * count) / 2 - 1 */
  const y = i % 2 === 0 ? 0.5 : -0.5
  const z = Math.sin(t) * rad
  /* const z = 0 */
  return [x, y, z]
})

const indices = Array.from({ length: positions.length * 3 }, (_, i) => i)

const getTexCoord = (n: number, max: number) => {
  const t = n / (max / 2 - 1)
  return [t, 0, t, 1]
}

const texCoords = Array.from({ length: count }, (_, i) =>
  getTexCoord(i, count),
).flat()

const ribbon = {
  buffers: [
    {
      attributes: [
        {
          name: 'i_Position',
          numComponents: 3,
        },
      ],
      data: new Float32Array(positions.flat()),
    },
    {
      /* prettier-ignore */
      data: new Float32Array(texCoords),
      attributes: [
        {
          name: 'i_TexCoord',
          numComponents: 2,
          size: 1,
        },
      ],
    },
  ],
  indices: new Uint16Array(indices),
}

const shape = ribbon
const normals = computeFaceNormals(ribbon)
console.log(normals)

/* addFaceColors(shape) */

const vMat = viewMat()
const pMat = projectionMat()

const redTex = createTexture(gl, {
  name: 'u_Texture',
  width: textCanvas.width,
  height: textCanvas.height,
  internalFormat: 'RGB8',
  filter: 'LINEAR',
  format: 'RGB',
  wrap: 'REPEAT',
  type: 'UNSIGNED_BYTE',
  data: textCanvas,
})

const uniforms = {
  u_ModelMatrix: identityMat(),
  u_ViewMatrix: vMat,
  u_ProjectionMatrix: pMat,
  u_Texture: redTex,
}

const { program, vao, setters } = initProgram(gl, {
  vertShader,
  fragShader,
  bufferGroup: shape,
})

gl.bindVertexArray(vao)
gl.useProgram(program)
setUniforms(setters, uniforms)

const draw = (time: number) => {
  gl.clearColor(...clearColor)
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const smallTime = time * 0.001

  const modelMat = matFromTransformations({
    translation: [0, 0, -6],
    rotation: {
      axis: [0, 1, 0],
      /* axis: [cos(sin(smallTime)), cos(sin(smallTime)), sin(cos(smallTime))], */
      angle: -smallTime,
    },
    scale: [1, 1, 1],
  })

  setUniforms(setters, {
    ...uniforms,
    u_ModelMatrix: modelMat,
    u_NormalMatrix: normalMatFromModel(modelMat),
    u_Time: time,
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.lineWidth(5)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, shape.indices.length / 3)

  /* labelVertices(ctx, shape, combineMatrices([pMat, vMat, modelMat])) */

  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
