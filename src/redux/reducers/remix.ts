import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { COMPILED_CONTRACT } from "../../models"

const initialCompiledSolidityFilesState: Record<
  string, // path
  { compiled: boolean; contracts: Record<string, COMPILED_CONTRACT> } // file can contain multiple solidity contracts
> = {}

const initialState = { compiledSolidityFiles: initialCompiledSolidityFilesState }

export const remixSlice = createSlice({
  name: "remix",
  initialState,
  reducers: {
    newSolidityFile: (state, action: PayloadAction<string>) => {
      state.compiledSolidityFiles[action.payload] = { compiled: false, contracts: {} }
    },

    solidityFileCompiled: (
      state,
      action: PayloadAction<{ path: string; contracts: Record<string, COMPILED_CONTRACT> }>
    ) => {
      // only treat solidity files managed by the plugin
      if (state.compiledSolidityFiles[action.payload.path]) {
        state.compiledSolidityFiles[action.payload.path].compiled = true
        state.compiledSolidityFiles[action.payload.path].contracts = action.payload.contracts
      }
    },
  },
})

export const { newSolidityFile, solidityFileCompiled } = remixSlice.actions

export default remixSlice.reducer
