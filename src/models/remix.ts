import { ABIDescription } from "@remixproject/plugin-api"

export interface READ_DIR_RESPONSE {
  [key: string]: {
    isDirectory: boolean
  }
}

export interface COMPILED_CONTRACT {
  bytecode: string
  abi: ABIDescription[]
}
