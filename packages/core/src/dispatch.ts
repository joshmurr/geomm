import type { Fn } from '@geomm/api'

export const functionName = (fn: Fn<unknown>): string => {
  const name = Object?.getOwnPropertyDescriptor(fn, 'name')?.value
  return name || 'no-name'
}

export const dispatch = (fns: Fn<unknown>[]) => {
  const dispatcher = fns.reduce(
    (d, fn) => ({
      ...d,
      [functionName(fn)]: fn,
    }),
    {},
  )
  return dispatcher
}
