import { ActionCreatorWithPayload, AnyAction, Dispatch } from "@reduxjs/toolkit"

export const dispatchHandler = <T>(dispatcher: Dispatch<AnyAction>, reducer: ActionCreatorWithPayload<T>) => {
  return (payload: T) => {
    dispatcher(reducer(payload))
  }
}
