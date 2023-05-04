import { add, canvas } from '@geomm/dom'
import { dist, vec } from '@geomm/geometry'
import type { Vec } from '@geomm/geometry/lib/api'
import { defaultState } from './defaultState'
import { drawCircle, drawCurveWithControlPoints } from './drawing'
import type { State } from './types'

let state: State

const init = () => {
  const savedState = localStorage.getItem('state')
  if (savedState) {
    state = JSON.parse(savedState) as State
  } else {
    state = defaultState
  }
}

let MOUSE = vec(0, 0)

const c = canvas(512, 512)
add(c)

const save = add('button')
save.innerText = 'Save'
save.addEventListener('click', () => {
  localStorage.setItem('state', JSON.stringify(state))
})

const ctx = c.getContext('2d') as CanvasRenderingContext2D

const draw = () => {
  ctx.fillStyle = 'lightgrey'
  ctx.fillRect(0, 0, 512, 512)

  state.curves.forEach(({ points }) => {
    const [start, cp1, cp2, end] = points as [Vec, Vec, Vec, Vec]
    drawCurveWithControlPoints(ctx, start, cp1, cp2, end)
  })

  state.curves.forEach(({ points }) => {
    points.forEach((p) => {
      if (dist(MOUSE, p) < 10) {
        drawCircle(ctx, p, 10, 'grey')
      }
    })
  })

  requestAnimationFrame(draw)
}

const handleMouseMove = (e: MouseEvent) => {
  MOUSE = vec(e.clientX, e.clientY)
  if (state.selected.id !== null) {
    const { id, pointIdx } = state.selected
    const curve = state.curves.find((c) => c.id === id)
    if (curve) {
      curve.points[pointIdx] = MOUSE
    }
  }
}

const handleMouseDown = (e: MouseEvent) => {
  const { clientX, clientY } = e
  const p = vec(clientX, clientY)
  state.curves.forEach(({ id, points }) => {
    points.forEach((point, i) => {
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
