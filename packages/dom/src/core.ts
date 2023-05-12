const isEventListener = (key: string) => key.startsWith('on')

export const createEl = <T extends HTMLElement>(
  type: string,
  opts?: {
    [key: string]: number | string | EventListenerOrEventListenerObject
  },
): T => {
  const el = document.createElement(type) as T
  if (opts) {
    Object.keys(opts).forEach((key) => {
      if (isEventListener(key)) {
        el.addEventListener(
          key.slice(2).toLowerCase(),
          opts[key] as EventListenerOrEventListenerObject,
        )
        return
      }

      el.setAttribute(key, opts[key].toString())
    })
  }

  return el
}

export const appendEl = (
  el: HTMLElement | string,
  parent?: HTMLElement | null,
) => {
  const element = typeof el === 'string' ? createEl<HTMLElement>(el) : el
  const p = parent || document.body
  p.appendChild(element)
  return element
}
