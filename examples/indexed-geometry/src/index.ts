import { initProgram, setUniforms, webgl2Canvas } from '@geomm/webgl'
import {
  cos,
  identityMat,
  matFromTransformations,
  normalMatFromModel,
  projectionMat,
  sin,
  viewMat,
} from '@geomm/maths'
import { appendEl, canvas2d } from '@geomm/dom'
import { mat4, vec4 } from 'gl-matrix'
import {
  addFaceColors,
  computeFaceNormals,
  indexedIcosahedron,
} from '@geomm/geometry'
import { partial, transduce } from '@geomm/core'
import type { Reducer } from '@geomm/core'

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

out vec2 v_TexCoord;
out vec3 v_Lighting;
out vec4 v_Normal;
out vec4 v_Color;

void main(){
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;

  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  vec3 directionalLightColor = vec3(1, 1, 1);
  vec3 directionalVector = normalize(vec3(0.85, 0.8, 2.0));

  vec4 transformedNormal = u_NormalMatrix * vec4(i_Normal, 1.0);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  v_Lighting = ambientLight + (directionalLightColor * directional);
  v_Normal = transformedNormal;
  v_Color = i_Color;
  gl_PointSize = 5.0;
}`

const fragShader = `#version 300 es
precision mediump float;

in vec2 v_TexCoord;
in vec3 v_Lighting;
in vec4 v_Normal;
in vec4 v_Color;

out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = vec4(v_Color.rgb * v_Lighting, 1.0);
  /* OUTCOLOUR = vec4(v_Normal.xyz, 1.0); */
}`

const shape = indexedIcosahedron
computeFaceNormals(shape)
addFaceColors(shape)

const [c, gl] = webgl2Canvas(512, 512)
const [textCanvas, ctx] = canvas2d(512, 512)
appendEl(c)
appendEl(textCanvas)

const vMat = viewMat()
const pMat = projectionMat()

const uniforms = {
  u_ModelMatrix: identityMat(),
  u_ViewMatrix: vMat,
  u_ProjectionMatrix: pMat,
}

const { program, vao, setters } = initProgram(gl, {
  vertShader,
  fragShader,
  bufferGroup: shape,
})

gl.bindVertexArray(vao)
gl.useProgram(program)
setUniforms(setters, uniforms)

const matMul = partial(mat4.mul, mat4.create())
const combineMatrices = (ms: mat4[]) =>
  transduce(
    (rf: Reducer<mat4>) => (m1: mat4, m2: mat4) => rf(m1, m2),
    matMul,
    mat4.create(),
    ms,
  )

const transformVec = (v: vec4, m: mat4) =>
  vec4.transformMat4(vec4.create(), v, m)

const draw = (time: number) => {
  gl.clearColor(0.2, 0.2, 0.4, 1)
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const smallTime = time * 0.001

  const modelMat = matFromTransformations({
    translation: [0, 0, -6],
    rotation: {
      axis: [cos(sin(smallTime)), cos(sin(smallTime)), sin(cos(smallTime))],
      angle: smallTime,
    },
    scale: [1, 1, 1],
  })

  setUniforms(setters, {
    ...uniforms,
    u_ModelMatrix: modelMat,
    u_NormalMatrix: normalMatFromModel(modelMat),
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.lineWidth(5)
  gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0)

  ctx.clearRect(0, 0, c.width, c.height)
  const positions = shape.buffers.find((b) =>
    b.attributes.find((a) => a.name === 'i_Position'),
  )?.data
  if (!positions) return
  for (let i = 0; i < positions.length; i += 3) {
    const p = positions.slice(i, i + 3)
    const mvp = combineMatrices([pMat, vMat, modelMat])
    const clipspace = transformVec(vec4.fromValues(...p, 1), mvp)

    // divide X and Y by W just like the GPU does.
    clipspace[0] /= clipspace[3]
    clipspace[1] /= clipspace[3]

    // convert from clipspace to pixels
    const pixelX = (clipspace[0] * 0.5 + 0.5) * c.width
    const pixelY = (clipspace[1] * -0.5 + 0.5) * c.height

    // save all the canvas settings
    ctx.save()

    // translate the canvas origin so 0, 0 is at
    // the top front right corner of our F
    ctx.translate(pixelX, pixelY)
    ctx.rotate(i * Math.PI * 0.8)

    /* ctx.font = `${scale}px monospace` */
    const fill = `rgba(255,255,255,${clipspace[2] - 7 > 0 ? 0.5 : 1})`
    ctx.fillStyle = fill
    ctx.strokeStyle = fill
    // draw an arrow
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(15, 15)
    ctx.stroke()

    // draw the text.
    ctx.fillText((i / 3).toString(), 20, 20)

    // restore the canvas to its old settings.
    ctx.restore()
  }

  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
