export const sdfCircle = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number,
) => {
  const dx = x - cx
  const dy = y - cy
  return Math.sqrt(dx * dx + dy * dy) - r
}

export const sdfSquare = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number,
) => {
  const dx = Math.abs(x - cx)
  const dy = Math.abs(y - cy)
  return Math.max(dx, dy) - r
}

export const sdfRoundedSquare = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number,
  r2: number,
) => {
  const dx = Math.abs(x - cx)
  const dy = Math.abs(y - cy)
  const d = Math.max(dx, dy) - r
  const d2 = Math.sqrt(dx * dx + dy * dy) - r2
  return Math.min(d, d2)
}

export const smoothstep = (min: number, max: number, value: number) => {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}
