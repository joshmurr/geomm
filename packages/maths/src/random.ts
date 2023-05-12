export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
export const randRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}
