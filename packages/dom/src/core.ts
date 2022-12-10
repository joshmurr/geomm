export const createEl = <T>(type: string): T => {
  return document.createElement(type) as T
}

export const add = (el: HTMLElement) => {
  document.body.appendChild(el)
}
