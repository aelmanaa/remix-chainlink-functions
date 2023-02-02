import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { BalanceStateReducer } from "../../models"
import { BigNumberish } from "ethers"

const initialState: BalanceStateReducer = {
  native: 0,
  link: 0,
}

export const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {
    changeNativeBalance: (state, action: PayloadAction<BigNumberish>) => {
      state.native = action.payload
    },
    changeLinkBalance: (state, action: PayloadAction<BigNumberish>) => {
      state.link = action.payload
    },
  },
})

export const { changeNativeBalance, changeLinkBalance } = balanceSlice.actions

export default balanceSlice.reducer
