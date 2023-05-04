import { add, canvas } from '@geomm/dom'
import { dist, vec } from '@geomm/geometry'
import { defaultState, N_FRAMES } from './defaultState'
import { drawCircle, drawCurve, drawCurveWithControlPoints } from './drawing'
import type { State } from './types'
import { lerpCurve } from './utils'

let state: State
let MOUSE = vec(0, 0)
const c = canvas(512, 512)
add(c)
const ctx = c.getContext('2d') as CanvasRenderingContext2D

const init = () => {
  const savedState = localStorage.getItem('state')
  if (savedState) {
    state = JSON.parse(savedState) as State
  } else {
    state = defaultState
  }
}

const save = add('button') as HTMLButtonElement
save.innerText = 'Save'
save.addEventListener('click', () => {
  localStorage.setItem('state', JSON.stringify(state))
})
const snapshot = add('button') as HTMLButtonElement
snapshot.innerText = 'Snapshot'
snapshot.addEventListener('click', () => {
  state.curves.forEach((curve) => {
    curve.prev = [...curve.curve]
  })
})
const genFrames = add('button') as HTMLButtonElement
genFrames.innerText = 'Generate Frames'
genFrames.addEventListener('click', () => {
  state.curves.forEach(({ curve, prev, frames }) => {
    for (let i = 0; i < N_FRAMES; i++) {
      const t = i / N_FRAMES
      frames[i] = lerpCurve(prev, curve, t)
    }
  })
})
const animate = add('button') as HTMLButtonElement
animate.innerText = 'animate'
animate.addEventListener('click', () => (state.animate = !state.animate))

const draw = () => {
  ctx.fillStyle = 'lightgrey'
  ctx.fillRect(0, 0, 512, 512)

  state.curves.forEach(({ curve, prev, frames }) => {
    if (state.animate) {
      const { frame } = state
      const [start, cp1, cp2, end] = frames[frame % N_FRAMES]
      drawCurve(ctx, start, cp1, cp2, end)
      state.frame++
    } else {
      const [start, cp1, cp2, end] = curve
      drawCurveWithControlPoints(ctx, start, cp1, cp2, end)

      const [pre_start, pre_cp1, pre_cp2, pre_end] = prev
      drawCurve(ctx, pre_start, pre_cp1, pre_cp2, pre_end, 'grey')
    }
  })

  state.curves.forEach(({ curve }) => {
    curve.forEach((p) => {
      if (dist(MOUSE, p) < 10) {
        drawCircle(ctx, p, 10, 'grey')
      }
    })
  })

  setTimeout(() => requestAnimationFrame(draw), 20)
}

const handleMouseMove = (e: MouseEvent) => {
  MOUSE = vec(e.clientX, e.clientY)
  if (state.selected.id !== null) {
    const { id, pointIdx } = state.selected
    const curve = state.curves.find((c) => c.id === id)
    if (curve) {
      curve.curve[pointIdx] = MOUSE
    }
  }
}

const handleMouseDown = (e: MouseEvent) => {
  const { clientX, clientY } = e
  const p = vec(clientX, clientY)
  state.curves.forEach(({ id, curve }) => {
    curve.forEach((point, i) => {
      if (dist(p, point) < 50) {
        state.selected = { id, pointIdx: i }
      }
    })
  })
}

const handleMouseUp = () => {
  state.selected = { id: null, pointIdx: -1 }
}

c.addEventListener('mousemove', handleMouseMove)
c.addEventListener('mousedown', handleMouseDown)
c.addEventListener('mouseup', handleMouseUp)

init()
requestAnimationFrame(draw)
