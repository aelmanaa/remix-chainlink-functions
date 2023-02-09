import { ProviderRpcError, SUPPORTED_CHAIN } from "../models"
import { reverseChainLookup } from "../data"

export const getChain = async () => {
  return (await window.ethereum.request({
    method: "eth_chainId",
  })) as string
}

export const switchChain = async (chainId: string, chainHandler: (chain: SUPPORTED_CHAIN) => void) => {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId }],
  })
  chainHandler(reverseChainLookup[chainId] as SUPPORTED_CHAIN)
}

export const handleChainChanged = (
  chainId: string,
  chainHandler: (chain: SUPPORTED_CHAIN) => void,
  chainConnectedHandler: (connected: boolean) => void,
  chainErrorMessage: (message: string) => void,
  error?: ProviderRpcError
) => {
  if (chainId) {
    chainHandler(reverseChainLookup[chainId] as SUPPORTED_CHAIN)
    if (window.ethereum && window.ethereum.isConnected()) {
      chainConnectedHandler(true)
      chainErrorMessage("")
    } else {
      chainConnectedHandler(false)
    }
  } else {
    chainConnectedHandler(false)
    chainErrorMessage(error && error.message ? error.message : "Disconnected from chain")
  }
}
