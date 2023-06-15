import { createEl } from '.'
import type { Settings } from './api'

export const makeGui = (settings: Settings) => {
  const gui = createEl('div') as HTMLDivElement
  gui.classList.add('gui')
  Object.entries(settings).forEach(([key, setting]) => {
    const label = createEl('label') as HTMLLabelElement
    label.htmlFor = key
    label.innerText = key
    gui.appendChild(label)

    switch (setting.type) {
      case 'checkbox':
        gui.appendChild(
          createEl('input', {
            type: 'checkbox',
            id: key,
            onchange: (e: MouseEvent) => {
              const val = (e.target as HTMLInputElement).checked
              setting.val = val
            },
          }),
        )
        break

      case 'range':
        gui.appendChild(
          createEl('input', {
            type: 'range',
            id: key,
            min: setting.min,
            max: setting.max,
            value: setting.val,
            oninput: (e: MouseEvent) => {
              const val = parseFloat((e.target as HTMLInputElement).value)
              setting.val = val * (setting?.scale || 1)
            },
          }),
        )
        break

      case 'file':
        gui.appendChild(
          createEl('input', {
            type: 'file',
            id: key,
            onchange: (e: MouseEvent) =>
              setting.callback((e.target as HTMLInputElement).files),
          }),
        )
        break

      default: {
        /* Exhaustive check */
        const _exhaustiveCheck: never = setting
        return _exhaustiveCheck
      }
    }
  })

  return gui
}

export const updateGuiValues = (settings: Settings, gui: HTMLDivElement) => {
  Object.entries(settings).forEach(([key, setting]) => {
    const el = gui.querySelector(`#${key}`) as HTMLInputElement
    switch (setting.type) {
      case 'range':
        el.value = `${setting.val / (setting?.scale || 1)}`
        break
      case 'checkbox':
        el.checked = setting.val
        break
      default:
        return null
    }
  })
}
