const isEventListener = (key: string) => key.startsWith('on')

type CreateElOpts = {
  [key: string]:
    | number
    | string
    | EventListenerOrEventListenerObject
    | ((e: MouseEvent) => void)
}

export const createEl = <T extends HTMLElement>(
  type: string,
  opts?: CreateElOpts,
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      el[key] = opts[key].toString()
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

export const prependEl = (
  el: HTMLElement | string,
  parent?: HTMLElement | null,
) => {
  const element = typeof el === 'string' ? createEl<HTMLElement>(el) : el
  const p = parent || document.body
  p.prepend(element)
  return element
}

export const withChildren = (
  el: HTMLElement,
  children: HTMLElement[],
): HTMLElement => {
  children.forEach((child) => el.appendChild(child))
  return el
}

export const getEl = (selector: string) => document.querySelector(selector)
