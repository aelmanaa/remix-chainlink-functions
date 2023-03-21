export interface ChainStateReducer {
  chain: SUPPORTED_CHAIN
  chainConnected: boolean
  errorMessage: string
}

export const supportedChains = ["POLYGON_MUMBAI", "ETHEREUM_SEPOLIA"] as const
export type SUPPORTED_CHAIN = (typeof supportedChains)[number]
