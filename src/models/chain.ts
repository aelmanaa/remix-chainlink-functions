export interface ChainStateReducer {
  value: string
  connected: boolean
  errorMessage: string
}

export type SUPPORTED_CHAINS = "POLYGON_MUMBAI" | "ETHEREUM_GOERLI"
