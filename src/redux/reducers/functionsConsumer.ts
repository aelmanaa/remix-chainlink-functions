import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { EXPECTED_RETURN_TYPE, Location, REQUEST, SUBSCRIPTION, TRANSACTION } from "../../models"

const initialRequestState: REQUEST = {
  secrets: "",
  args: [],
  sourcePath: "",
  gasLimit: 500000,
  secretLocation: Location.Inline,
  expectedReturnType: EXPECTED_RETURN_TYPE.Buffer,
}
const initialState: {
  address: string
  request: REQUEST
  subscription: SUBSCRIPTION
  transactions: TRANSACTION[]
  numberSecrets: number
} = {
  address: "",
  request: initialRequestState,
  subscription: {
    id: 0,
    balance: 0,
    owner: "",
  },
  transactions: [],
  numberSecrets: 1,
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
    setTransaction: (state, action: PayloadAction<TRANSACTION>) => {
      const index = state.transactions.findIndex((element) => element.requestId === action.payload.requestId)
      if (index > -1) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload }
      } else {
        state.transactions.push(action.payload)
      }
    },
    setTransactions: (state, action: PayloadAction<TRANSACTION[]>) => {
      state.transactions = action.payload
    },
    incrementSecretNumber: (state) => {
      state.numberSecrets++
    },
  },
})

export const {
  setAddress: setFunctionsConsumerAddress,
  setRequest: setFunctionsConsumerExecuteRequest,
  setSubscription: setFunctionsConsumerSubscription,
  setTransaction,
  setTransactions,
  incrementSecretNumber,
} = functionsConsumerSlice.actions

export default functionsConsumerSlice.reducer
