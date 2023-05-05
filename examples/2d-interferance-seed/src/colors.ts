export const hexColors = {
  red: '#E25A24',
  pink: '#FCBAC6',
  white: '#FFF6D4',
  blue: '#5A66FF',
  black: '#44393B',
  yellow: '#E8E825',
}

export const hexToRgb = (hex: string) => {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)

  return { r, g, b }
}

export const intRgbToFloat = (rgb: { r: number; g: number; b: number }) => {
  return Object.values(rgb).map((c) => c / 255)
}

export const valToHue = (val: number, min: number, max: number) => {
  const l = (val - min) / (max - min)
  return l * 360
}

const valToGray = (val: number, min: number, max: number) => {
  const l = (val - min) / (max - min)
  return l * 255
}

export const displayExpo = (value: number | string, f: number) => {
  return Number.parseFloat(value.toString()).toExponential(f)
}

export const displayArrayValuesInTable = (
  arr: Float32Array,
  width: number,
  height: number,
  min: number,
  max: number,
) => {
  const table = document.createElement('table')

  for (let i = 0; i < height; i++) {
    const tr = document.createElement('tr')
    for (let j = 0; j < width; j += 4) {
      const td = document.createElement('td')
      const val = arr[i * width + j]
      td.innerText = val.toFixed(1) // displayExpo(val, 2)
      const gray = valToGray(val, min, max)
      td.style.backgroundColor = `rgb(${gray}, ${gray}, ${gray})`
      tr.appendChild(td)
    }
    table.appendChild(tr)
  }

  document.body.appendChild(table)
}
