export const hexToRgb = (hex: string) => {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)

  return { r, g, b }
}

export const intRgbToFloat = (rgb: { r: number; g: number; b: number }) => {
  return Object.values(rgb).map((c) => c / 255) as [number, number, number]
}

export const valToHue = (val: number, min: number, max: number) => {
  const l = (val - min) / (max - min)
  return l * 360
}

export const valToGray = (val: number, min: number, max: number) => {
  const l = (val - min) / (max - min)
  return l * 255
}
