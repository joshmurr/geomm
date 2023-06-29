export const ratio = (a: number, b: number) => a / b
export const aspect = (w: number, h: number) => ratio(w, h)
export const isPowerOf2 = (value: number) => (value & (value - 1)) === 0
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)
