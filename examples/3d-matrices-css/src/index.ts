import { createEl, getEl } from '@geomm/dom'
import { PI, identityMat, matFromTransformations } from '@geomm/maths'

const FONT_SIZE = 32
const FONT_FAMILY = 'monospace'
document.body.style.fontFamily = FONT_FAMILY
document.body.style.fontSize = `${FONT_SIZE}px`

const sentence =
  'Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat.'

const letters = sentence.split('')
const wordElements = []
for (let i = 0; i < letters.length; i++) {
  const letter = letters[i]
  const innerText = letter
  const el = createEl('span', { classList: 'word', innerText })
  el.style.transitionDelay = `${i * 0.04}s`

  wordElements.push(el)
}

const container = getEl('.container') as HTMLDivElement

wordElements.forEach((word) => container.appendChild(word))

const modelViewMat = matFromTransformations({
  translation: [0, FONT_SIZE, 0],
  rotation: {
    axis: [0.95, 0, 0],
    angle: PI * 0.6,
  },
  scale: [0.5, 1, 1],
})
const idMat = identityMat()

const matToString = (mat: Float32Array) => {
  return mat.join(', ')
}

document.documentElement.style.setProperty(
  '--mat',
  `matrix3d(${matToString(modelViewMat)})`,
)
document.documentElement.style.setProperty('--op', `0`)

let t = false
const toggleMatrix = () => {
  if (t) {
    document.documentElement.style.setProperty(
      '--mat',
      `matrix3d(${matToString(idMat)})`,
    )
    document.documentElement.style.setProperty('--op', `1`)
  } else {
    document.documentElement.style.setProperty(
      '--mat',
      `matrix3d(${matToString(modelViewMat)})`,
    )
    document.documentElement.style.setProperty('--op', `0`)
  }
  t = !t
}

document.body.addEventListener('click', toggleMatrix)
