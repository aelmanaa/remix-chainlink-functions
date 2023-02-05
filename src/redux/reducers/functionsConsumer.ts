import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

const initialState = {
  address: "",
}

export const functionsConsumerSlice = createSlice({
  name: "functionsConsumer",
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload
    },
  },
})

export const { setAddress: setFunctionsConsumerAddress } = functionsConsumerSlice.actions

export default functionsConsumerSlice.reducer
