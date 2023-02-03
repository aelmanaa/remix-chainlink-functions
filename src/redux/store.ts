import { configureStore } from "@reduxjs/toolkit"
import { accountReducer, chainReducer, contextReducer, balanceReducer } from "./reducers"

export const store = configureStore({
  reducer: {
    account: accountReducer,
    chain: chainReducer,
    balance: balanceReducer,
    context: contextReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
