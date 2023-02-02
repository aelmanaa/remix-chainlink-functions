import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { ChainStateReducer } from "../../models"

const initialState: ChainStateReducer = {
  value: "",
  connected: false,
  errorMessage: "",
}

export const chainSlice = createSlice({
  name: "chain",
  initialState,
  reducers: {
    changeChain: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
    changeConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload
    },

    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload
    },
  },
})

export const { changeChain, changeConnected, setErrorMessage: setChainErrorMessage } = chainSlice.actions

export default chainSlice.reducer
