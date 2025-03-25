import { dot3, vec3, reflect3 } from '@geomm/maths'
import type { RGB } from '@geomm/color'
import type { Mat4, Vec3 } from '@geomm/api'

export interface PhongMaterial {
  ambient: RGB
  diffuse: RGB
  specular: RGB
  shininess: number
}

export interface Uniforms {
  normal: Vec3
  lightDir: Vec3
  lightColor: RGB
  viewDir: Vec3
  edgeColor: RGB
  fillColor: RGB
  edgeThickness: number
  material: PhongMaterial
}

export type VertexShader = (
  {
    vertices,
    indices,
    normals,
  }: {
    vertices: Float32Array
    indices: Uint16Array
    normals: Float32Array
  },
  {
    modelMat,
    viewMat,
    perspectiveMat,
  }: {
    modelMat: Mat4
    viewMat: Mat4
    perspectiveMat: Mat4
  },
) => {
  clipCoords: Vec3[]
  normals: Vec3[]
}

export type FragmentShader = ({
  position,
  barycentricCoords,
  vertices,
}: {
  position: Vec3
  barycentricCoords: Vec3
  vertices: Vec3[]
}) => RGB

export const normalShader =
  (uniforms: Uniforms): FragmentShader =>
  (): RGB => {
    return [
      (uniforms.normal.x + 1) * 0.5,
      (uniforms.normal.y + 1) * 0.5,
      (uniforms.normal.z + 1) * 0.5,
    ]
  }

export const barycentricShader =
  (): FragmentShader =>
  ({ barycentricCoords }) => {
    return [barycentricCoords.x, barycentricCoords.y, barycentricCoords.z]
  }

export const lightingShader =
  (uniforms: Uniforms): FragmentShader =>
  () => {
    const ambientIntensity = 0.2
    const diffuseIntensity = Math.max(
      0,
      dot3(uniforms.normal, uniforms.lightDir),
    )
    const intensity =
      ambientIntensity + diffuseIntensity * (1 - ambientIntensity)

    return [intensity, intensity, intensity]
  }

export const wireframeShader =
  (uniforms: Uniforms): FragmentShader =>
  ({ barycentricCoords }): RGB => {
    // Find the minimum barycentric coordinate
    const minBary = Math.min(
      barycentricCoords.x,
      barycentricCoords.y,
      barycentricCoords.z,
    )

    // If any barycentric coordinate is close to zero, we're near an edge
    const edgeThickness = uniforms.edgeThickness || 0.03
    const edgeColor = uniforms.edgeColor || [0, 0, 0] // Default black
    const fillColor = uniforms.fillColor || [0.8, 0.8, 0.8] // Default gray

    if (minBary < edgeThickness) {
      return [edgeColor[0], edgeColor[1], edgeColor[2]]
    } else {
      return [fillColor[0], fillColor[1], fillColor[2]]
    }
  }

export const createPhongMaterial = (
  ambient: RGB = [0.1, 0.1, 0.1],
  diffuse: RGB = [0.7, 0.7, 0.7],
  specular: RGB = [1.0, 1.0, 1.0],
  shininess: number = 32,
): PhongMaterial => {
  return { ambient, diffuse, specular, shininess }
}

export const phongShader =
  (uniforms: Uniforms): FragmentShader =>
  () => {
    const { viewDir, lightDir, normal } = uniforms

    const reflectDir = reflect3(
      vec3(-lightDir.x, -lightDir.y, -lightDir.z),
      normal,
    )

    const ambient = uniforms.material.ambient.map(
      (c, i) => c * uniforms.lightColor[i] * 0.3,
    )

    const diffuseFactor = Math.max(dot3(normal, lightDir), 0)
    const diffuse = uniforms.material.diffuse.map(
      (c, i) => c * uniforms.lightColor[i] * diffuseFactor,
    )

    const specularFactor = Math.pow(
      Math.max(dot3(viewDir, reflectDir), 0),
      uniforms.material.shininess,
    )
    const specular = uniforms.material.specular.map(
      (c, i) => c * uniforms.lightColor[i] * specularFactor,
    )

    // Combine all lighting components
    return [
      ambient[0] + diffuse[0] + specular[0],
      ambient[1] + diffuse[1] + specular[1],
      ambient[2] + diffuse[2] + specular[2],
    ]
  }
