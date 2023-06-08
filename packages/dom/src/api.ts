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

export type Settings = {
  [key: string]: Setting
}
