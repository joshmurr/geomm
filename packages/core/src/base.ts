export const apply = <T>(x: T, f: (x: T) => unknown) => {
  return f(x)
}

export const compose = <T>(...fns: Array<(a: T) => T>) => {
  return (value) => fns.reduceRight((value, nextFn) => nextFn(value), value)
}

export const concat = <AccRes>(acc: AccRes[], val: AccRes): AccRes[] => {
  return [...acc, val]
}

export const partial = (fn: (...a: any[]) => any, ...args: any[]) => {
  return fn.bind(null, ...args)
}

export const group = <T>(xs: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(xs.length / size) }, (_, i) =>
    xs.slice(i * size, i * size + size),
  )
}
