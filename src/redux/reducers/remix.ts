import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { COMPILED_FILE } from "../../models"

const initialCompiledSolidityFilesState: Record<
  string, // path
  COMPILED_FILE // file can contain multiple solidity contracts
> = {}

const initialState = {
  compiledSolidityFiles: initialCompiledSolidityFilesState,
  selectedContract: {
    fileName: "",
    contractName: "",
  },
}

export const remixSlice = createSlice({
  name: "remix",
  initialState,
  reducers: {
    newSolidityFile: (state, action: PayloadAction<string>) => {
      state.compiledSolidityFiles[action.payload] = { compiled: false, contracts: {} }
    },

    solidityFileCompiled: (state, action: PayloadAction<{ path: string; compilationResult: COMPILED_FILE }>) => {
      // only treat solidity files managed by the plugin
      if (state.compiledSolidityFiles[action.payload.path]) {
        state.compiledSolidityFiles[action.payload.path].compiled = action.payload.compilationResult.compiled
        state.compiledSolidityFiles[action.payload.path].contracts = action.payload.compilationResult.contracts
        state.compiledSolidityFiles[action.payload.path].errors = action.payload.compilationResult.errors
      }
    },

    selectContract: (state, action: PayloadAction<{ fileName: string; contractName: string }>) => {
      state.selectedContract.fileName = action.payload.fileName
      state.selectedContract.contractName = action.payload.contractName
    },
  },
})

export const { newSolidityFile, solidityFileCompiled, selectContract } = remixSlice.actions

export default remixSlice.reducer
