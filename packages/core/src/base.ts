import { Reducer } from './api'

export const apply = <T>(x: T, f: (x: T) => unknown) => {
  return f(x)
}

export const compose = <T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) => {
  return fns.reduceRight(
    (prevFn, nextFn) => (value) => prevFn(nextFn(value)),
    fn1,
  )
}

export const concat: Reducer<any> = (acc, val) => {
  return acc.concat(val)
}

export const partial = <T>(fn: (a: T) => T, ...args: T[]) => {
  return fn.bind(null, ...args)
}
