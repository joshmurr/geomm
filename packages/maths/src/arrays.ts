export const linspace = (start: number, end: number, segments: number) => {
  const step = (end - start) / segments
  return Array.from({ length: segments + 1 }, (_, i) => start + step * i)
}

export const reshape = (arr: number[], shape: number[]) => {
  const [rows, cols] = shape
  const result = [] as number[][]
  for (let i = 0; i < rows; i++) {
    result.push(arr.slice(i * cols, (i + 1) * cols))
  }
  return result
}
