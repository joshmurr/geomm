import { randRange } from '@geomm/maths'
import face from './images/face.png'

export const circle = (num_parts: number) => {
  return new Promise<Float32Array>((resolve) => {
    const points = []
    for (let i = 0; i < num_parts; ++i) {
      /* const x = i % c.width // % is the "modulo operator", the remainder of i / width; */
      /* const y = Math.floor(i / c.width) */

      /* const dist = gaussian(x, y) */
      const dist = Math.random() * 0.5
      const xp = Math.cos(i) * dist
      const yp = Math.sin(i) * dist

      points.push(xp, yp)
    }
    resolve(new Float32Array(points))
  })
}

export const invCircle = (num_parts: number) => {
  return new Promise<Float32Array>((resolve) => {
    const points = []
    for (let i = 0; i < num_parts; ++i) {
      const dist = randRange(0.5, 1)
      const xp = Math.cos(i) * dist
      const yp = Math.sin(i) * dist

      points.push(xp, yp)
    }
    resolve(new Float32Array(points))
  })
}

export const square = (num_parts: number) => {
  return new Promise<Float32Array>((resolve) => {
    const points = []
    for (let i = 0; i < num_parts; ++i) {
      const dist = Math.random() * 0.38
      const xp = Math.cos(Math.random() * i) * dist
      const yp = Math.sin(Math.random() * i) * dist

      points.push(xp, yp)
    }
    resolve(new Float32Array(points))
  })
}

export const random = (num_parts: number) => {
  return new Promise<Float32Array>((resolve) => {
    const points = []
    for (let i = 0; i < num_parts; ++i) {
      const xp = Math.random() * 2 - 1
      const yp = Math.random() * 2 - 1

      points.push(xp, yp)
    }
    resolve(new Float32Array(points))
  })
}

export const fromImage = async (imgSrc: string) => {
  return new Promise<Float32Array>((resolve) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      ctx.drawImage(img, 0, 0)
      console.log(img.width, img.height)
      const data = ctx.getImageData(0, 0, img.width, img.height).data
      const points = []
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]
        if (a > 0) {
          const x = (i / 4) % img.width
          const y = Math.floor(i / 4 / img.width)
          points.push(x / 512 - 1, 1 - y / 512)
        }
      }
      resolve(new Float32Array(points))
    }

    img.src = imgSrc
  })
}

export const fromFaceImg = () => fromImage(face)
