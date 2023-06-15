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
      type: 'file'
      callback: (file: FileList | null) => void
    }

export type Settings = {
  [key: string]: Setting
}
