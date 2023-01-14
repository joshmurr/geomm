import {
  createVAO,
  cubeBuffer,
  getUniformSetters,
  setUniforms,
  shaderProgram,
  webgl2Canvas,
} from '@geomm/webgl'
import { add } from '@geomm/dom'
import {
  identityMat,
  matFromTransformations,
  normalMatFromModel,
  projectionMat,
  viewMat,
} from '@geomm/maths'
import { nIndices } from '@geomm/geometry'

const vert = `#version 300 es
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
out vec4 v_Color;
out vec3 v_Lighting;

void main(){
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;
  v_Color = i_Color;

  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  vec3 directionalLightColor = vec3(1, 1, 1);
  vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  vec4 transformedNormal = u_NormalMatrix * vec4(i_Normal, 1.0);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  v_Lighting = ambientLight + (directionalLightColor * directional);
}`

const frag = `#version 300 es
precision mediump float;

in vec2 v_TexCoord;
in vec3 v_Lighting;
in vec4 v_Color;

out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = vec4(v_Color.rgb * v_Lighting, 1.0);
}`

const [c, gl] = webgl2Canvas(512, 512)
add(c)

const program = shaderProgram(gl, vert, frag)

const cubeBuf = cubeBuffer(gl, program)
const cubeVAO = createVAO(gl, cubeBuf)

const uniforms = {
  u_ModelMatrix: identityMat(),
  u_ViewMatrix: viewMat(),
  u_ProjectionMatrix: projectionMat(),
}

const uniformSetters = getUniformSetters(gl, program)

gl.bindVertexArray(cubeVAO)
gl.useProgram(program)
setUniforms(uniformSetters, uniforms)

const draw = (time: number) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.clearColor(0.9, 0.9, 0.9, 1)

  const smallTime = time * 0.001

  const modelViewMat = matFromTransformations({
    translation: [0, 0, -6],
    rotation: {
      axis: [1, 1, 1],
      angle: smallTime,
    },
    scale: [1, 1, 1],
  })

  setUniforms(uniformSetters, {
    ...uniforms,
    u_ModelMatrix: modelViewMat,
    u_NormalMatrix: normalMatFromModel(modelViewMat),
  })

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.drawElements(gl.TRIANGLES, nIndices(cubeBuf), gl.UNSIGNED_SHORT, 0)
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
