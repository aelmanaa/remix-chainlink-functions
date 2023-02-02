import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { ChainStateReducer, SUPPORTED_CHAIN } from "../../models"

const initialState: ChainStateReducer = {
  chain: "POLYGON_MUMBAI",
  chainConnected: false,
  errorMessage: "",
}

export const chainSlice = createSlice({
  name: "chain",
  initialState,
  reducers: {
    changeChain: (state, action: PayloadAction<SUPPORTED_CHAIN>) => {
      state.chain = action.payload
    },
    changeChainConnected: (state, action: PayloadAction<boolean>) => {
      state.chainConnected = action.payload
    },

    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload
    },
  },
})

export const { changeChain, changeChainConnected, setErrorMessage: setChainErrorMessage } = chainSlice.actions

export default chainSlice.reducer
