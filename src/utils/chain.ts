import { AnyAction, Dispatch } from "redux"
import { ProviderRpcError } from "../models"
import { changeChain, changeChainConnected, setChainErrorMessage, setFunctionsConsumerAddress } from "../redux/reducers"
import { reverseChainLookup } from "../data"

export const getChain = async () => {
  return (await window.ethereum.request({
    method: "eth_chainId",
  })) as string
}

export const switchChain = async (chainId: string) => {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId }],
  })
}

export const handleChainChanged = (chainId: string, dispatch: Dispatch<AnyAction>, error?: ProviderRpcError) => {
  if (chainId) {
    dispatch(changeChain(reverseChainLookup[chainId]))
    dispatch(setFunctionsConsumerAddress(""))
    if (window.ethereum && window.ethereum.isConnected()) {
      dispatch(changeChainConnected(true))
      dispatch(setChainErrorMessage(""))
    } else {
      dispatch(changeChainConnected(false))
    }
  } else {
    dispatch(changeChainConnected(false))
    dispatch(setChainErrorMessage(error && error.message ? error.message : "Disconnected from chain"))
  }
}
