import { useEffect } from "react"
import { Alert } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import {
  initializeAccounts,
  changeChainConnected,
  setAccountErrorMessage,
  setChainErrorMessage,
  setContextErrorMessage,
} from "../redux/reducers"
import { Account, Networks, Balance } from "."
import { ConnectInfo, ProviderRpcError } from "../models"
import { RootState } from "../redux/store"
import { getAccounts, getChain, handleAccountsChanged, handleChainChanged } from "../utils"

export const Context = () => {
  const dispatch = useDispatch()
  const errorMessage = useSelector((state: RootState) => state.context.errorMessage)
  useEffect(() => {
    const chainConnectHandler = (connectInfo: ConnectInfo) => {
      handleChainChanged(connectInfo.chainId, dispatch)
    }

    const chainDisconnectHandler = (error: ProviderRpcError) => {
      handleChainChanged("", dispatch, error)
    }

    const chainHandler = (chainId: string) => {
      handleChainChanged(chainId, dispatch)
    }

    const accountsHandler = (accounts: string[]) => {
      handleAccountsChanged(accounts, dispatch)
    }
    const connect = async () => {
      if (window.ethereum) {
        const { ethereum } = window
        try {
          const accounts = await getAccounts()
          handleAccountsChanged(accounts, dispatch)
        } catch (err) {
          console.error(err)
          handleAccountsChanged([], dispatch, err as ProviderRpcError)
        }
        try {
          const chainId = await getChain()
          handleChainChanged(chainId, dispatch)
        } catch (err) {
          console.error(err)
          handleChainChanged("", dispatch, err as ProviderRpcError)
        }
        dispatch(setContextErrorMessage(""))
        // Register events
        ethereum.on("accountsChanged", accountsHandler)
        ethereum.on("chainChanged", chainHandler)
        ethereum.on("connect", chainConnectHandler)
        ethereum.on("disconnect", chainDisconnectHandler)
      } else {
        dispatch(setContextErrorMessage("Install MetaMask"))
        dispatch(setAccountErrorMessage(""))
        dispatch(initializeAccounts({ accounts: [], selectedAccount: "" }))
        dispatch(changeChainConnected(false))
        dispatch(setChainErrorMessage(""))
      }
    }
    connect()
    return () => {
      // cleanup logic
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", accountsHandler)
        window.ethereum.removeListener("chainChanged", chainHandler)
        window.ethereum.removeListener("connect", chainConnectHandler)
        window.ethereum.removeListener("disconnect", chainDisconnectHandler)
      }
    }
  }, [dispatch])
  return (
    <div>
      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : ""}
      <Account />
      <Networks />
      <Balance />
    </div>
  )
}
