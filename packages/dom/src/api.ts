export type Setting =
  | {
      type: 'range'
      val: number
      min: number
      max: number
      scale?: number
    }
  | {
      type: 'checkbox'
      val: boolean
    }
  | {
      type: 'select'
      val: string
      options: string[]
      callback?: (val: string) => void
    }
  | {
      type: 'file'
      callback: (file: FileList | null) => void
      val?: unknown
    }
  | {
      type: 'button'
      val: string
      callback: (e: Event) => void
    }

export type Settings = {
  [key: string]: Setting
}

export type UnfiformSettings = {
  [key: string]: Exclude<Settings, { type: 'file' }>
}
