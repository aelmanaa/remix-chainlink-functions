import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { AccountState, AccountStateReducer } from "../../models"

const initialState: AccountStateReducer = {
  value: {
    selectedAccount: "",
    accounts: [""],
  },
  errorMessage: "",
}

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    initializeAccounts: (state, action: PayloadAction<AccountState>) => {
      state.value = action.payload
    },
    changeSelectedAccount: (state, action: PayloadAction<string>) => {
      state.value.selectedAccount = action.payload
    },
    changeAccounts: (state, action: PayloadAction<string[]>) => {
      state.value.accounts = action.payload
    },
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload
    },
  },
})

export const {
  initializeAccounts,
  changeSelectedAccount,
  changeAccounts,
  setErrorMessage: setAccountErrorMessage,
} = accountSlice.actions

export default accountSlice.reducer
