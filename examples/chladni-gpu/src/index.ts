import {
  appendEl,
  createEl,
  getEl,
  makeGui,
  Settings,
  updateGuiValues,
} from '@geomm/dom'
import {
  createBufferInfo,
  createTexture,
  createVAO,
  getUniformSetters,
  setUniforms,
  shaderProgram,
  uniformsFromSettings,
  updateTexture,
} from '@geomm/webgl'
import { hexToRgb, intRgbToFloat } from '@geomm/color'
import { hexColors } from './colors'
import displacementImg from './images/14.png'
import { render_fs, render_vs, update_fs, update_vs } from './shaders'
import {
  circle,
  fromFaceImg,
  invCircle,
  square,
  random,
  fromImage,
} from './initialDataFns'
import { initOutput, initPreviews } from './domHandlers'

const initialDataFns = [circle, invCircle, square, fromFaceImg, random]
let selectedInitialDataFn = circle

const { c, gl } = initOutput()

const settings: Settings = {
  minWalk: {
    type: 'range',
    val: 0.00076,
    min: 0,
    max: 100,
    scale: 0.0001,
  },
  A: {
    type: 'range',
    val: 2.9,
    min: 0.0001,
    max: 3.0,
  },
  a: {
    type: 'range',
    val: 2,
    min: -10,
    max: 10,
  },
  b: {
    type: 'range',
    val: 4.2,
    min: -10,
    max: 10,
  },
  m: {
    type: 'range',
    val: 6,
    min: -10,
    max: 10,
  },
  n: {
    type: 'range',
    val: 4,
    min: -10,
    max: 10,
  },
  vel: {
    type: 'range',
    val: 0.0002,
    min: 0,
    max: 100,
    scale: 0.0001,
  },
  chladniDisplace: {
    type: 'range',
    val: 0.0,
    min: 0,
    max: 200,
    scale: 0.01,
  },
  imgDisplace: {
    type: 'range',
    val: 0.0,
    min: 0,
    max: 1000,
    scale: 0.001,
  },
  displaceFromCenter: {
    type: 'range',
    val: 0,
    min: 0,
    max: 5,
  },
  particleSeed: {
    type: 'select',
    val: 'circle',
    options: initialDataFns.map((fn) => fn.name),
    callback: (val: string) => {
      selectedInitialDataFn =
        initialDataFns.find((fn) => fn.name === val) || circle
      init()
    },
  },
  particleColor: {
    type: 'select',
    val: 'red',
    options: Object.keys(hexColors),
  },
  backgroundColor: {
    type: 'select',
    val: 'pink',
    options: Object.keys(hexColors),
    callback: (val: string) => {
      document.body.style.backgroundColor =
        hexColors[val as keyof typeof hexColors]
    },
  },
  displacementImg: {
    type: 'file',
    callback: (files: FileList | null) =>
      handleFileLoad(files, (e) => {
        const previewImg = getEl(
          '#displacement-img-preview',
        ) as HTMLImageElement
        previewImg.onload = () => {
          updateTexture(gl, { ...displacementTex, data: previewImg.src })
        }
        const target = e.target as FileReader
        const result = target.result as string
        previewImg.src = result
      }),
  },
  backplateImg: {
    type: 'file',
    callback: (files: FileList | null) => {
      handleFileLoad(files, (e) => {
        const img = getEl('#backplate-img') as HTMLImageElement
        const previewImg = getEl('#backplate-img-preview') as HTMLImageElement
        previewImg.classList.remove('hidden')
        img.onload = () => {
          img.classList.remove('hidden')
        }
        const target = e.target as FileReader
        img.src = target.result as string
        previewImg.src = target.result as string
      })
    },
  },
  maskImg: {
    type: 'file',
    callback: (files: FileList | null) => {
      handleFileLoad(files, (e) => {
        const img = getEl('#mask-img-preview') as HTMLImageElement
        img.onload = () => {
          const el = getEl('.masked-backplate') as HTMLDivElement
          el.style.maskImage = `url(${img.src})`
          el.style.webkitMaskImage = `url(${img.src})`
          img.classList.remove('hidden')
        }
        const target = e.target as FileReader
        img.src = target.result as string
      })
    },
  },
  seedImg: {
    type: 'file',
    callback: (files: FileList | null) => {
      handleFileLoad(files, (e) => {
        const target = e.target as FileReader
        const result = target.result as string
        const img = getEl('#seed-img-preview') as HTMLImageElement
        img.src = result
        img.classList.remove('hidden')
        selectedInitialDataFn = () => fromImage(result)
        init()
      })
    },
  },
  record: {
    type: 'button',
    val: 'Start Recording',
    callback: () => toggleRecording(),
  },
  play: {
    type: 'button',
    val: 'play',
    callback: () => play(),
  },
  download: {
    type: 'button',
    val: 'download',
    callback: () => download(),
  },

  audioUpload: {
    type: 'file',
    callback: (files: FileList | null) => {
      handleFileLoad(files, (e) => {
        const target = e.target as FileReader
        const result = target.result as string
        audio = new Audio()
        audio.loop = true
        audio.autoplay = false
        audio.addEventListener('canplay', handleCanplay)
        audio.src = result
        audio.load()

        function handleCanplay() {
          audioInitialized = true
          const source = context.createMediaElementSource(audio)
          source.connect(analyser)
          analyser.connect(context.destination)
        }
      })
    },
  },
  audioPlay: {
    type: 'button',
    val: 'playAudio',
    callback: () => {
      audioPlaying ? audio.pause() : audio.play()
      audioPlaying = !audioPlaying
    },
  },
}

let audio: HTMLAudioElement
const mediaSource = new MediaSource()
mediaSource.addEventListener('sourceopen', handleSourceOpen, false)
let mediaRecorder: MediaRecorder
let recordedBlobs: Blob[]
let sourceBuffer: SourceBuffer

/* const canvas = document.querySelector('canvas') */
const video = createEl<HTMLVideoElement>('video')
appendEl(video)

let recordButton: HTMLButtonElement
let playButton: HTMLButtonElement
let downloadButton: HTMLButtonElement
/* let playAudioButton: HTMLButtonElement */

const stream = c.captureStream() // frames per second
console.log('Started stream capture from canvas element: ', stream)

function handleSourceOpen() {
  console.log('MediaSource opened')
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"')
  console.log('Source buffer: ', sourceBuffer)
}

function handleDataAvailable(event: MediaRecorderEventMap['dataavailable']) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data)
  }
}

function handleStop(event: unknown) {
  console.log('Recorder stopped: ', event)
  const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' })
  video.src = window.URL.createObjectURL(superBuffer)
}

function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording()
  } else {
    stopRecording()
    recordButton.textContent = 'Start Recording'
    playButton.disabled = false
    downloadButton.disabled = false
  }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  let options = { mimeType: 'video/webm' }
  recordedBlobs = []
  try {
    mediaRecorder = new MediaRecorder(stream, options)
  } catch (e0) {
    console.log('Unable to create MediaRecorder with options Object: ', e0)
    try {
      options = { mimeType: 'video/webm,codecs=vp9' }
      mediaRecorder = new MediaRecorder(stream, options)
    } catch (e1) {
      console.log('Unable to create MediaRecorder with options Object: ', e1)
      try {
        options = { mimeType: 'video/vp8' } // Chrome 47
        mediaRecorder = new MediaRecorder(stream, options)
      } catch (e2) {
        alert(
          'MediaRecorder is not supported by this browser.\n\n' +
            'Try Firefox 29 or later, or Chrome 47 or later, ' +
            'with Enable experimental Web Platform features enabled from chrome://flags.',
        )
        console.error('Exception while creating MediaRecorder:', e2)
        return
      }
    }
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options)
  recordButton.textContent = 'Stop Recording'
  playButton.disabled = true
  downloadButton.disabled = true
  mediaRecorder.onstop = handleStop
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.start(100) // collect 100ms of data
  console.log('MediaRecorder started', mediaRecorder)
}

function stopRecording() {
  mediaRecorder.stop()
  video.controls = true
}

function play() {
  video.play()
}

function download() {
  const blob = new Blob(recordedBlobs, { type: 'video/webm' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = 'test.webm'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 100)
}

const displacementTex = createTexture(gl, {
  name: 'displacementImg',
  type: 'UNSIGNED_BYTE',
  format: 'RGBA',
  internalFormat: 'RGBA',
  data: displacementImg,
})

const handleFileLoad = (
  files: FileList | null,
  onload: (e: ProgressEvent) => void | null,
) => {
  if (files) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = onload
    reader.readAsDataURL(file)
  }
}

const mouse = [0, 0, 0]

const gui = makeGui(settings)
gui.classList.add('gui')
appendEl(gui)

const attribs = ['position']
const update = shaderProgram(gl, {
  vertShader: update_vs,
  fragShader: update_fs,
  transformFeedbackVaryings: attribs.map((name) => `v_${name}`),
})
const render = shaderProgram(gl, {
  vertShader: render_vs,
  fragShader: render_fs,
})

const NUM_PARTICLES = 100000

initPreviews([
  {
    id: 'seed-img-preview',
    className: 'hidden',
    src: '',
    note: 'A PNG to define where the dots should be placed initially. Dots will be places on black, rest should be transparent.',
  },
  {
    id: 'mask-img-preview',
    className: 'hidden',
    src: '',
    note: 'A PNG mask for the backplate image. Annoyingly inverted, so black is what will be seen, transparent will be masked.',
  },
  {
    id: 'backplate-img-preview',
    className: 'hidden',
    src: '',
    note: 'An image to be should behind the dots. Can be masked with a mask image.',
  },
  {
    id: 'displacement-img-preview',
    src: displacementImg,
    note: 'Helps steer the movements of the dots in the simulation. White to black can be thought of as high-energy to low-energy where high-energy means more movement.',
  },
])

const context = new AudioContext()
const analyser = context.createAnalyser()

// Make a buffer to receive the audio data
const numPoints = analyser.frequencyBinCount
const audioDataArray = new Uint8Array(numPoints).fill(0)
let audioInitialized = false
let audioPlaying = false

const audioTex = createTexture(gl, {
  name: 'audioTex',
  format: 'LUMINANCE',
  internalFormat: 'LUMINANCE',
  type: 'UNSIGNED_BYTE',
  filter: 'NEAREST',
  wrap: 'CLAMP_TO_EDGE',
  width: numPoints,
  height: 1,
  data: audioDataArray,
})

async function init() {
  const data = await selectedInitialDataFn(NUM_PARTICLES)
  const numParticles = data.length / 2

  recordButton = getEl('#record') as HTMLButtonElement
  playButton = getEl('#play') as HTMLButtonElement
  downloadButton = getEl('#download') as HTMLButtonElement

  const buffers = [
    gl.createBuffer() as WebGLBuffer,
    gl.createBuffer() as WebGLBuffer,
  ]

  const FLOAT_SIZE = 4
  const updateBuffers = buffers.map((buf) =>
    createBufferInfo(
      gl,
      {
        data,
        buffer: buf,
        usage: gl.STREAM_DRAW,
        attributes: attribs.map((name, j) => {
          const numComponents = name === 'position' ? 2 : 1
          const stride = FLOAT_SIZE * 2
          const offset = j * 2 * FLOAT_SIZE

          return {
            name: `a_${name}`,
            numComponents,
            stride,
            offset,
          }
        }),
      },
      update,
    ),
  )

  const renderBuffers = buffers.map((buf) =>
    createBufferInfo(
      gl,
      {
        data,
        buffer: buf,
        usage: gl.STREAM_DRAW,
        attributes: [
          {
            name: 'a_position',
            numComponents: 2,
            stride: FLOAT_SIZE * 2,
            offset: 0,
          },
        ],
      },
      render,
    ),
  )

  const updateVAOs = Array.from({ length: 2 }, (_, i) =>
    createVAO(gl, [updateBuffers[i]]),
  )
  const renderVAOs = Array.from({ length: 2 }, (_, i) =>
    createVAO(gl, [renderBuffers[i]]),
  )

  const updateUniformSetters = getUniformSetters(gl, update)
  const renderUniformSetters = getUniformSetters(gl, render)

  const state = [
    {
      update: updateVAOs[0],
      render: renderVAOs[0],
    },
    {
      update: updateVAOs[1],
      render: renderVAOs[1],
    },
  ]

  let count = 0
  function step(time: number) {
    /* gl.clearColor(...intRgbToFloat(hexToRgb(hexColors.pink)), 1.0) */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    /* gl.clearColor(0, 0, 0, 1) */
    gl.useProgram(update)
    gl.bindVertexArray(state[count % 2].update)
    /* Set uniforms */
    analyser.getByteFrequencyData(audioDataArray)
    setUniforms(updateUniformSetters, {
      ...uniformsFromSettings(settings),
      time: time,
      displacementTex,
      ...(audioInitialized && {
        audioTex: updateTexture(gl, { ...audioTex, data: audioDataArray }),
      }),
      mouse,
    })
    /* Bind the "write" buffer as transform feedback - the varyings of the
     update shader will be written here. */
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffers[++count % 2])

    /* Since we're not actually rendering anything when updating the particle
     state, disable rasterization.*/
    gl.enable(gl.RASTERIZER_DISCARD)

    /* Begin transform feedback! */
    gl.beginTransformFeedback(gl.POINTS)

    gl.drawArrays(gl.POINTS, 0, numParticles)
    gl.endTransformFeedback()
    gl.disable(gl.RASTERIZER_DISCARD)
    /* Don't forget to unbind the transform feedback buffer! */
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)

    /* Now, we draw the particle system. Note that we're actually
     drawing the data from the "read" buffer, not the "write" buffer
     that we've written the updated data to. */

    gl.bindVertexArray(state[++count % 2].render)
    gl.useProgram(render)
    setUniforms(renderUniformSetters, {
      particleColor: intRgbToFloat(
        hexToRgb(
          hexColors[settings.particleColor.val as keyof typeof hexColors],
        ),
      ),
    })
    gl.drawArrays(gl.POINTS, 0, numParticles)
    count++

    window.requestAnimationFrame(step)
  }

  c.addEventListener('mousedown', () => {
    init()
    mouse[2] = 1
  })
  c.addEventListener('mouseup', () => (mouse[2] = 0))
  c.addEventListener('mouseover', () => {
    settings.chladniDisplace.val = 0.08
    settings.imgDisplace.val = 0.1
  })
  c.addEventListener('mouseout', () => {
    settings.chladniDisplace.val = 0.01
    settings.imgDisplace.val = 0.02
  })
  c.addEventListener('mousemove', (e: MouseEvent) => {
    const scaledMouseX = e.clientX / c.width
    const scaledMouseY = e.clientY / c.height

    settings.a.val = scaledMouseX * 10
    settings.b.val = 1 - scaledMouseX * 10
    settings.m.val = scaledMouseY * 10
    settings.n.val = 1 - scaledMouseY * 10

    updateGuiValues(settings, gui)
  })

  window.requestAnimationFrame(step)
}

init()

console.log('glError:', gl.getError())
