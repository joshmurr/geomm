export const createEl = <T>(type: string): T => {
  return document.createElement(type) as T
}

export const add = (el: Node | string) => {
  const element = typeof el === 'string' ? createEl<Node>(el) : el
  document.body.appendChild(element)
  return element
}
