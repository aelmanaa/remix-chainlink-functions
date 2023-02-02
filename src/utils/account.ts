import { AnyAction, Dispatch } from "redux"
import { AccountState, ProviderRpcError } from "../models"
import { initializeAccounts, setAccountErrorMessage } from "../redux/reducers"

export const getAccounts = async () => {
  return (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[]
}

export const handleAccountsChanged = (accounts: string[], dispatch: Dispatch<AnyAction>, error?: ProviderRpcError) => {
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
