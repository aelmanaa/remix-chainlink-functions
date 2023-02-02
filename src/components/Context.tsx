import { useEffect } from "react"
import { Alert } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import {
  initializeAccounts,
  changeChain,
  changeConnected,
  setAccountErrorMessage,
  setChainErrorMessage,
  setContextErrorMessage,
} from "../redux/reducers"
import { Account, Networks } from "."
import { AccountState, ConnectInfo, ProviderRpcError } from "../models"
import { RootState } from "../redux/store"

export const Context = () => {
  const dispatch = useDispatch()
  const errorMessage = useSelector((state: RootState) => state.context.errorMessage)
  const connect = async () => {
    console.log("connectHandler IN")
    if (window.ethereum) {
      const { ethereum } = window

      try {
        const accounts = (await ethereum.request({
          method: "eth_requestAccounts",
        })) as string[]
        handleAccountsChanged(accounts)
      } catch (err) {
        console.error(err)
        handleAccountsChanged([], err as ProviderRpcError)
      }
      try {
        const chainId = (await ethereum.request({
          method: "eth_chainId",
        })) as string
        handleChainChanged(chainId)
      } catch (err) {
        console.error(err)
        handleChainChanged("", err as ProviderRpcError)
      }
      dispatch(setContextErrorMessage(""))
      // Register events
      ethereum.on("accountsChanged", handleAccountsChanged)
      ethereum.on("chainChanged", handleChainChanged)
      ethereum.on("connect", handleConnectChanged)
      ethereum.on("disconnect", handleDisconnectChanged)
    } else {
      dispatch(setContextErrorMessage("Install MetaMask"))
      dispatch(setAccountErrorMessage(""))
      dispatch(initializeAccounts({ accounts: [], selectedAccount: "" }))
      dispatch(changeChain(""))
      dispatch(changeConnected(false))
      dispatch(setChainErrorMessage(""))
    }
  }
  const handleAccountsChanged = (accounts: string[], error?: ProviderRpcError) => {
    console.log("aem accounts changed", accounts)
    if (error) {
      dispatch(setAccountErrorMessage(`Cannot get accounts from Metamask ${error.message}`))
      dispatch(initializeAccounts({ accounts: [], selectedAccount: "" }))
    } else {
      const accountState: AccountState =
        accounts.length > 0
          ? {
              selectedAccount: accounts[0],
              accounts,
            }
          : { selectedAccount: "", accounts: [] }
      dispatch(initializeAccounts(accountState))
      dispatch(setAccountErrorMessage(""))
    }
  }
  const handleChainChanged = (chainId: string, error?: ProviderRpcError) => {
    console.log("aem chain changed", chainId)
    if (chainId) {
      dispatch(changeChain(chainId))
      if (window.ethereum && window.ethereum.isConnected()) {
        dispatch(changeConnected(true))
        dispatch(setChainErrorMessage(""))
      } else {
        dispatch(changeConnected(false))
      }
    } else {
      dispatch(changeChain(""))
      dispatch(changeConnected(false))
      dispatch(setChainErrorMessage(error && error.message ? error.message : "Disconnected from chain"))
    }
  }

  const handleConnectChanged = (connectInfo: ConnectInfo) => {
    console.log("aem connect changed", connectInfo)
    console.error(connectInfo)
    handleChainChanged(connectInfo.chainId)
  }

  const handleDisconnectChanged = (error: ProviderRpcError) => {
    console.error(error)

    handleChainChanged("")
  }
  useEffect(() => {
    console.log("useEffect fired")
    connect()
    return () => {
      // cleanup logic
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("connect", handleConnectChanged)
        window.ethereum.removeListener("disconnect", handleDisconnectChanged)
      }
    }
  })
  return (
    <div>
      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : ""}
      <Account />
      <Networks />
    </div>
  )
}