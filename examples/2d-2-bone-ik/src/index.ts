import type { Vec2 } from '@geomm/api'
import { appendEl, canvas2d } from '@geomm/dom'
import { mag, sub, TWO_PI, vec2 } from '@geomm/maths'

const SIZE = vec2(512, 512)
const [c, ctx] = canvas2d(SIZE.x, SIZE.y)
appendEl(c)

const NUM_ARMS = 3
const BONE_1_LENGTH = 100
const BONE_2_LENGTH = 100

const calculateIK = (
  anchor: Vec2,
  bone1Length: number,
  bone2Length: number,
  targetPosition: Vec2,
) => {
  const d = sub(targetPosition, anchor)
  const targetDistance = mag(d)

  // Constrain target within maximum reach
  const maxReach = bone1Length + bone2Length
  const constrainedDistance = Math.min(targetDistance, maxReach)

  // If target is out of reach, place it on the line at max distance
  if (targetDistance > maxReach) {
    const angle = Math.atan2(d.y, d.x)
    return {
      joint: {
        x: anchor.x + Math.cos(angle) * bone1Length,
        y: anchor.y + Math.sin(angle) * bone1Length,
      },
      end: {
        x: anchor.x + Math.cos(angle) * maxReach,
        y: anchor.y + Math.sin(angle) * maxReach,
      },
    }
  }

  // Law of cosines to find the angle between the bones
  const cosAngle =
    (bone1Length * bone1Length +
      constrainedDistance * constrainedDistance -
      bone2Length * bone2Length) /
    (2 * bone1Length * constrainedDistance)
  const angle1 =
    Math.atan2(d.y, d.x) +
    (cosAngle < -1 ? Math.PI : Math.acos(Math.max(-1, Math.min(1, cosAngle))))

  // Calculate joint position (end of first bone)
  const joint = {
    x: anchor.x + bone1Length * Math.cos(angle1),
    y: anchor.y + bone1Length * Math.sin(angle1),
  }

  return { joint, end: targetPosition }
}

const target = vec2(SIZE.x / 2, SIZE.y / 2)

const createArm = (
  index: number,
  anchor: Vec2,
  bone1Length: number,
  bone2Length: number,
) => ({
  index,
  anchor,
  bone1Length,
  bone2Length,
  joint: vec2(0, 0),
  end: vec2(0, 0),
  update: function (target: Vec2) {
    const { joint, end } = calculateIK(
      this.anchor,
      this.bone1Length,
      this.bone2Length,
      target,
    )

    this.joint = joint
    this.end = end
  },
  draw: function (ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'grey'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(this.anchor.x, this.anchor.y)
    ctx.lineTo(this.joint.x, this.joint.y)
    ctx.stroke()
    ctx.strokeStyle = 'darkgrey'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(this.joint.x, this.joint.y)
    ctx.lineTo(this.end.x, this.end.y)
    ctx.stroke()
  },
})

const arms = Array.from({ length: NUM_ARMS }, (_, i) => {
  const rad = 200
  const anchor = vec2(
    SIZE.x / 2 + rad * Math.cos((TWO_PI * i) / NUM_ARMS),
    SIZE.y / 2 + rad * Math.sin((TWO_PI * i) / NUM_ARMS),
  )
  return createArm(i, anchor, BONE_1_LENGTH, BONE_2_LENGTH)
})

const draw = () => {
  ctx.fillStyle = 'lightgrey'
  ctx.fillRect(0, 0, SIZE.x, SIZE.y)

  arms.forEach((arm) => {
    arm.update(target)
    arm.draw(ctx)
  })
}

draw()

c.addEventListener('mousemove', (e) => {
  target.x = e.offsetX
  target.y = e.offsetY
  draw()
})
