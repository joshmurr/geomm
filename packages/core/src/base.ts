import { Reducer } from './api'

export const apply = <T>(x: T, f: (x: T) => unknown) => {
  return f(x)
}

export const compose = <T>(...fns: Array<(a: T) => T>) => {
  return (value) => fns.reduceRight((value, nextFn) => nextFn(value), value)
}

export const compose2 =
  (...fns) =>
    (x) =>
      fns.reduceRight((y, f) => f(y), x)

export const concat: Reducer<any> = (acc, val) => {
  return acc.concat(val)
}

export const partial = (fn: (...a: any[]) => any, ...args: any[]) => {
  return fn.bind(null, ...args)
}
