export interface ChainStateReducer {
  value: string
  connected: boolean
  errorMessage: string
}

export const supportedChains = ["POLYGON_MUMBAI", "ETHEREUM_GOERLI"] as const
export type SUPPORTED_CHAIN = (typeof supportedChains)[number]
