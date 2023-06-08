import { appendEl, createEl } from '.'
import type { Settings } from './api'

export const makeGui = (settings: Settings) => {
  const gui = createEl('div') as HTMLDivElement
  gui.classList.add('gui')
  Object.entries(settings).forEach(([key, setting]) => {
    const entry = createEl('div')
    const label = createEl('span')
    label.innerText = key
    entry.appendChild(label)
    switch (setting.type) {
      case 'checkbox':
        entry.appendChild(
          createEl('input', {
            type: 'checkbox',
            onchange: (e: MouseEvent) => {
              const val = (e.target as HTMLInputElement).checked
              settings[key].val = val
            },
          }),
        )
        gui.appendChild(entry)
        break

      case 'range':
        entry.appendChild(
          createEl('input', {
            type: 'range',
            min: setting.min,
            max: setting.max,
            value: setting.val,
            oninput: (e: MouseEvent) => {
              const val = parseFloat((e.target as HTMLInputElement).value)
              settings[key].val = val * (setting?.scale || 1)
            },
          }),
        )
        gui.appendChild(entry)
        break

      default: {
        /* Exhaustive check */
        const _exhaustiveCheck: never = setting
        return _exhaustiveCheck
      }
    }
  })

  appendEl(gui)
}
