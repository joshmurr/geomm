import { appendEl, createEl, type Settings } from '@geomm/dom'

export const makeGui = (settings: Settings) => {
  const gui = createEl('div') as HTMLDivElement
  gui.classList.add('gui')
  Object.entries(settings).forEach(([key, { val, min, max }]) => {
    const entry = createEl('div')
    const label = createEl('span')
    label.innerText = key
    entry.appendChild(label)
    switch (typeof val) {
      case 'boolean':
        console.log(val)
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

      case 'number':
        entry.appendChild(
          createEl('input', {
            type: 'range',
            min,
            max,
            value: val,
            oninput: (e: MouseEvent) => {
              const val = parseFloat((e.target as HTMLInputElement).value)
              settings[key].val = val
            },
          }),
        )
        gui.appendChild(entry)
        break

      case 'object':
        break

      default:
    }
  })

  appendEl(gui)
}
