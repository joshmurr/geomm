export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
export const randRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export const makeGaussian = (
  amplitude: number,
  x0: number,
  y0: number,
  sigmaX: number,
  sigmaY: number,
) => {
  return (x: number, y: number) => {
    const exponent = -(
      Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)) +
      Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2))
    )
    return amplitude * Math.pow(Math.E, exponent)
  }
}
