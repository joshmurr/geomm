export type Setting =
  | {
      type: 'range'
      displayName?: string
      val: number
      min: number
      max: number
      scale?: number
      offset?: number
      callback?: (e: Event) => void
    }
  | {
      type: 'checkbox'
      displayName?: string
      val: boolean
    }
  | {
      type: 'select'
      displayName?: string
      val: string
      options: string[]
      callback?: (val: string) => void
    }
  | {
      type: 'file'
      displayName?: string
      callback: (file: FileList | null) => void
      val?: unknown
    }
  | {
      type: 'button'
      displayName?: string
      val: string
      callback: (e: Event) => void
    }

export type Settings = {
  [key: string]: Setting
}

export type UnfiformSettings = {
  [key: string]: Exclude<Settings, { type: 'file' }>
}
