/*
 * A transducer is a function that takes a reducer and returns a reducer.
 * `mapping` and `filtering` on their own are not transducers, but once
 * they are called with a transformation function, they return a transducer.
 */

import { Reducer, Transducer } from './api'

export const mapping = <InputType, OutputType, AccRes>(
  transform: (x: InputType) => OutputType,
) => {
  return function (rf: Reducer<OutputType, AccRes>) {
    return (acc: AccRes, val: InputType) => {
      return rf(acc, transform(val))
    }
  }
}

// generalize the 'filtering' concept, without the concat...
export const filtering = <OutputType, AccRes>(
  predicate: (x: OutputType) => boolean,
) => {
  return function (rf: Reducer<OutputType, AccRes>) {
    return (acc: AccRes, val: OutputType) => {
      return predicate(val) ? rf(acc, val) : acc
    }
  }
}

export const transduce = <InputType, OutputType, AccRes>(
  transducer: Transducer<InputType, OutputType, AccRes>,
  reducer: Reducer<OutputType, AccRes>,
  initial: AccRes,
  data: InputType[],
): AccRes => {
  return data.reduce(transducer(reducer), initial)
}

export const composeTransducers = <
  InputType,
  IntermediateType,
  OutputType,
  AccRes,
>(
  firstTransducer: Transducer<InputType, IntermediateType, AccRes>,
  secondTransducer: Transducer<IntermediateType, OutputType, AccRes>,
): Transducer<InputType, OutputType, AccRes> => {
  return (finalReducer: Reducer<OutputType, AccRes>) =>
    firstTransducer(secondTransducer(finalReducer))
}
