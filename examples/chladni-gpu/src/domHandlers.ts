import { appendEl, createEl, withChildren } from '@geomm/dom'

export const initPreviews = (descs: Array<{ [key: string]: string }>) => {
  const items = descs.map((desc) =>
    withChildren(createEl('div', { className: 'preview-item' }), [
      createEl('img', desc),
      createEl<HTMLSpanElement>('span', { innerText: desc.id }),
    ]),
  )

  const wrapper = withChildren(
    createEl('div', { className: 'preview-wrapper' }),
    items,
  )
  appendEl(wrapper)
  return wrapper
}

export const initOutput = () => {
  const c = createEl('canvas', { width: 512, height: 512 }) as HTMLCanvasElement
  const gl = c.getContext('webgl2') as WebGL2RenderingContext

  const maskedBackplate = withChildren(
    createEl('div', { className: 'masked-backplate' }),
    [createEl('img', { id: 'backplate-img', className: 'hidden' })],
  )

  const wrapper = withChildren(
    createEl('div', { className: 'output-wrapper' }),
    [maskedBackplate, c],
  )

  appendEl(wrapper)

  return { c, gl }
}
