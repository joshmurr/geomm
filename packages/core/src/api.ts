// A reducer combines values of type InputValue into an accumulator of type AccumulatorResult
export type Reducer<InputValue, AccResult> = (
  acc: AccResult,
  val: InputValue,
) => AccResult

// A transducer transforms a reducer that accepts DownstreamValue
// into a reducer that accepts UpstreamValue instead
export type Transducer<UpstreamValue, DownstreamValue, AccResult> = (
  nextReducer: Reducer<DownstreamValue, AccResult>,
) => Reducer<UpstreamValue, AccResult>
