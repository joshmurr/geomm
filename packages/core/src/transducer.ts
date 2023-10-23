/*
 * A transducer is a function that takes a reducer and returns a reducer.
 * `mapping` and `filtering` on their own are not transducers, but once
 * they are called with a transformation functtion, they return a transducer.
 */

import { Reducer } from './api'

export const mapping = <T>(f: (x: T) => any) => {
  return function(rf: Reducer<T>) {
    return (acc: T, val: T) => {
      return rf(acc, f(val)) // <-- rf replaces 'concat'
    }
  }
}

// generalize the 'filtering' concept, without the concat...
export const filtering = <T>(p: (x: T) => boolean) => {
  return function(rf: Reducer<T>) {
    return (acc: T, val: T) => {
      return p(val) ? rf(acc, val) : acc // <-- rf replaces 'concat'
    }
  }
}

export const transduce = <T>(
  xf: (r: Reducer<T>) => Reducer<T>,
  rf: Reducer<T>,
  init: any,
  xs: T[],
) => {
  // call reduce on the data structure internally (abstract it away)
  // pass the rf to the composed transformation
  // pass in the initial value
  return xs.reduce(xf(rf), init)
}
