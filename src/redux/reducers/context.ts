import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { ContextStateReducer } from "../../models"

const initialState: ContextStateReducer = {
  errorMessage: "",
}

export const contextSlice = createSlice({
  name: "context",
  initialState,
  reducers: {
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload
    },
  },
})

export const { setErrorMessage: setContextErrorMessage } = contextSlice.actions

export default contextSlice.reducer
