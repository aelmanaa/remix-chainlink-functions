export interface RequestArguments {
  method: string
  params?: unknown[] | object
}

export interface ConnectInfo {
  chainId: string
}

export interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}
