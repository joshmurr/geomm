import { initProgram, setUniforms, webgl2Canvas } from '@geomm/webgl'
import {
  cos,
  createAxisAngleRotationMatrix,
  createPerspectiveMatrix,
  createViewMatrix,
  identity,
  matmul,
  normalMat,
  sin,
  translate,
  vec3,
} from '@geomm/maths'
import { IndexedBuffer, parseOBJ } from '@geomm/geometry'
import { appendEl } from '@geomm/dom'

const vertShader = `#version 300 es
precision mediump float;

in vec3 i_Position;
in vec3 i_Normal;
in vec3 i_FaceNormal;
in vec2 i_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

out vec2 v_TexCoord;
out vec3 v_Lighting;
out vec4 v_Normal;

void main(){
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;

  vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  vec3 directionalLightColor = vec3(1, 1, 1);
  vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  vec4 transformedNormal = u_NormalMatrix * vec4(i_Normal, 1.0);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  v_Lighting = ambientLight + (directionalLightColor * directional);
  v_Normal = transformedNormal;
}`

const fragShader = `#version 300 es
precision mediump float;

in vec2 v_TexCoord;
in vec3 v_Lighting;
in vec4 v_Normal;

out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = vec4(vec3(0.6, 0.6, 0.2) * v_Lighting, 1.0);
}`

async function loadObjFile(filePath: string): Promise<string> {
  const response = await fetch(filePath)
  return response.text()
}

loadObjFile('./src/gourd.obj').then((objFileContent) => {
  const shape = parseOBJ(objFileContent)
  main(shape)
})

const main = (shape: IndexedBuffer) => {
  const [c, gl] = webgl2Canvas(512, 512)
  appendEl(c)

  const eye = vec3(0, 0, 0)
  const target = vec3(0, 0, -1)
  const up = vec3(0, 1, 0)

  const viewMat = createViewMatrix(eye, target, up)

  const fovY = Math.PI / 4
  const aspect = 1
  const NEAR = 0.1
  const FAR = 50
  const perspectiveMat = createPerspectiveMatrix(fovY, aspect, NEAR, FAR)

  const uniforms = {
    u_ModelMatrix: identity,
    u_ViewMatrix: viewMat,
    u_ProjectionMatrix: perspectiveMat,
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
    gl.clearColor(0.2, 0.4, 0.2, 1)
    gl.clearDepth(1.0) // Clear everything
    gl.enable(gl.DEPTH_TEST) // Enable depth testing
    gl.depthFunc(gl.LEQUAL) // Near things obscure far things

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const smallTime = time * 0.001

    const rotationMat = createAxisAngleRotationMatrix(
      vec3(cos(sin(smallTime)), cos(sin(smallTime)), sin(cos(smallTime))),
      smallTime,
    )
    const modelViewMat = matmul(
      translate(identity, vec3(0, 0, -6)),
      rotationMat,
    )

    setUniforms(setters, {
      ...uniforms,
      u_ModelMatrix: modelViewMat,
      u_NormalMatrix: normalMat(modelViewMat),
    })

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.drawElements(gl.TRIANGLES, shape.indices.length, gl.UNSIGNED_SHORT, 0)
    requestAnimationFrame(draw)
  }

  requestAnimationFrame(draw)
}
