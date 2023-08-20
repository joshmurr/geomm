import { useCallback, useEffect, useRef } from 'react'
import { basicFrag, basicVert, initProgram, setUniforms } from '@geomm/webgl'
import { quad } from '@geomm/geometry'
import type { Setters } from '@geomm/webgl/lib/api'
import type { StringMap } from '@geomm/api'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  const draw = useCallback(
    (
      gl: WebGL2RenderingContext,
      time: number,
      setters: Setters,
      uniforms: StringMap<unknown>,
    ) => {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.clearColor(0.9, 0.9, 0.9, 1)

      const smallTime = time * 0.001
      setUniforms(setters, {
        ...uniforms,
        u_Time: smallTime,
      })

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    },
    [],
  )

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl2')!

    const { setters } = initProgram(gl, {
      vertShader: basicVert,
      fragShader: basicFrag,
      bufferGroup: quad,
    })

    const uniforms = {
      u_Resolution: [gl.canvas.width, gl.canvas.height],
    }

    let animationFrameId = 0
    const render = (time: number) => {
      draw(gl, time, setters, uniforms)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render(0)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default App
