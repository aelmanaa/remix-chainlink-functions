import { ABIDescription, CompilationError } from "@remixproject/plugin-api"

export interface READ_DIR_RESPONSE {
  [key: string]: {
    isDirectory: boolean
  }
}

export interface COMPILED_CONTRACT {
  bytecode: string
  abi: ABIDescription[]
}

export interface COMPILED_FILE {
  compiled: boolean
  contracts: Record<string, COMPILED_CONTRACT>
  errors?: CompilationError[]
}

export type LOG_TO_REMIX = (type: "info" | "html" | "warn" | "error" | "log", value: string) => Promise<void>
