import { useEffect } from "react"
import { Alert } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import {
  initializeAccounts,
  changeChain,
  setAccountErrorMessage,
  setChainErrorMessage,
  setContextErrorMessage,
} from "../redux/reducers"
import { Account, Networks } from "."
import { AccountState } from "../models"
import { RootState } from "../redux/store"

export const Context = () => {
  const dispatch = useDispatch()
  const errorMessage = useSelector((state: RootState) => state.context.errorMessage)
  const connectHandler = async () => {
    if (window.ethereum) {
      const { ethereum } = window

      try {
        const accounts = (await ethereum.request({
          method: "eth_requestAccounts",
        })) as string[]
        const accountState: AccountState = {
          selectedAccount: accounts[0],
          accounts,
        }
        dispatch(initializeAccounts(accountState))
        dispatch(setAccountErrorMessage(""))
      } catch (err) {
        console.error(err)
        dispatch(setAccountErrorMessage("Cannot get accounts from Metamask"))
        dispatch(initializeAccounts({ accounts: [], selectedAccount: "" }))
      }
      dispatch(setContextErrorMessage(""))
    } else {
      dispatch(setContextErrorMessage("Install MetaMask"))
      dispatch(setAccountErrorMessage(""))
      dispatch(initializeAccounts({ accounts: [], selectedAccount: "" }))
      dispatch(changeChain(""))
      dispatch(setChainErrorMessage(""))
    }
  }
  const handleAccountsChanged = (accounts: string[]) => {
    console.log("aem accounts changed", accounts)
    const accountState: AccountState =
      accounts.length > 0
        ? {
            selectedAccount: accounts[0],
            accounts,
          }
        : { selectedAccount: "", accounts: [] }
    dispatch(initializeAccounts(accountState))
  }
  const handleChainChanged = (chainId: string) => {
    console.log("aem chain changed", chainId)
    dispatch(changeChain(chainId))
  }
  useEffect(() => {
    if (window.ethereum) {
      const { ethereum } = window
      ethereum.on("accountsChanged", handleAccountsChanged)
      ethereum.on("chainChanged", handleChainChanged)

      return () => {
        // cleanup logic
        ethereum.removeListener("accountsChanged", handleAccountsChanged)
        ethereum.removeListener("chainChanged", handleChainChanged)
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
