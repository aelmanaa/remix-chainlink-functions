import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { Location, REQUEST, SUBSCRIPTION } from "../../models"

const initialRequestState: REQUEST = {
  secrets: "",
  args: [],
  sourcePath: "",
  gasLimit: 500000,
  secretLocation: Location.Inline,
}
const initialState: { address: string; request: REQUEST; subscription: SUBSCRIPTION } = {
  address: "",
  request: initialRequestState,
  subscription: {
    id: 0,
    balance: 0,
    owner: "",
  },
}

export const functionsConsumerSlice = createSlice({
  name: "functionsConsumer",
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
    setRequest: (state, action: PayloadAction<REQUEST>) => {
      state.request = { ...state.request, ...action.payload }
    },
    setSubscription: (state, action: PayloadAction<SUBSCRIPTION>) => {
      state.subscription = { ...state.subscription, ...action.payload }
    },
  },
})

export const {
  setAddress: setFunctionsConsumerAddress,
  setRequest: setFunctionsConsumerExecuteRequest,
  setSubscription: setFunctionsConsumerSubscription,
} = functionsConsumerSlice.actions

export default functionsConsumerSlice.reducer
