export interface AccountState {
  selectedAccount: string
  accounts: string[]
}

export interface AccountStateReducer {
  value: AccountState
  errorMessage: string
}
