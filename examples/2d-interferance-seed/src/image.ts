export const imageToFloat32Array = (
  image: HTMLImageElement,
  size: { width: number; height: number },
) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no ctx')
  ctx.drawImage(image, 0, 0, size.width, size.height)
  const data = ctx.getImageData(0, 0, size.width, size.height).data
  const pix = new Float32Array(data.length)
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < data.length; i += 4) {
    const e = Math.pow(data[i] / (255 * 1), 3)
    /* const e = 1 - Math.exp(-1 * pNorm) */
    if (e < min) min = e
    if (e > max) max = e
    pix[i] = e
    pix[i + 1] = 0
    pix[i + 2] = 0
    pix[i + 3] = 0
  }
  return { pix, min, max }
}

export const float32ArrayToImage = (
  pix: Float32Array,
  canvas: HTMLCanvasElement,
  size: { width: number; height: number },
) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no ctx')
  const data = ctx.getImageData(0, 0, size.width, size.height)
  for (let i = 0; i < pix.length; i += 4) {
    data.data[i] = pix[i] * 255
    data.data[i + 1] = pix[i + 1] * 255
    data.data[i + 2] = pix[i + 2] * 255
    data.data[i + 3] = 255
  }
  ctx.putImageData(data, 0, 0)
}

export const applyKernel = (
  kernel: number[][],
  pix: Float32Array,
  size: { width: number; height: number },
) => {
  const n = size.width
  const pix2 = new Float32Array(4 * n * n)
  for (let i = 0; i < n; i++) {
    const i1 = i - Math.floor(kernel.length / 2)
    for (let j = 0; j < n; j++) {
      const j1 = j - Math.floor(kernel.length / 2)
      let t = 4 * (i * n + j)
      let sum = 0
      for (let k = 0; k < kernel.length; k++) {
        for (let l = 0; l < kernel.length; l++) {
          const i3 = i1 + k
          const j3 = j1 + l
          if (i3 < 0 || i3 >= n || j3 < 0 || j3 >= n) continue
          const t2 = 4 * (i3 * n + j3)
          const v = kernel[k][l]
          sum += v * pix[t2]
        }
      }
      pix2[t++] = sum
      pix2[t++] = 0
      pix2[t++] = 0
      pix2[t++] = 0
    }
  }
  return pix2
}

export const blurKernel = [
  [0.0625, 0.125, 0.0625],
  [0.125, 0.25, 0.125],
  [0.0625, 0.125, 0.0625],
]

export const bottomSobel = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
]

export const scale = (v: number, k: number) => k / v

export const gauss5x5Kernel = [
  [1, 4, 6, 4, 1],
  [4, 16, 24, 16, 4],
  [6, 24, 36, 24, 6],
  [4, 16, 24, 16, 4],
  [1, 4, 6, 4, 1],
].map((row) => row.map((v) => scale(256, v)))
