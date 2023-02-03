import { chainsData, reverseChainLookup } from "../data"
import { SUPPORTED_CHAIN } from "../models"

export const compareAccounts = (accountA: string, accountB: string) => {
  if (!accountA || !accountB) return false
  if (accountA.toLowerCase() !== accountB.toLowerCase()) return false
  return true
}

export const formatAddress = (account: string) => {
  if (!account) return ""
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  const match = account.match(truncateRegex)
  if (!match) return account
  return `${match[1]}…${match[2]}`
}

export const chainNameFromChainId = (chainId: string) => {
  const chainKey = reverseChainLookup[chainId]
  if (!chainKey) return ""
  return chainsData[chainKey].name
}

export const chainNameFromChainKey = (chainKey: SUPPORTED_CHAIN) => {
  if (!chainKey) return ""
  return chainsData[chainKey].name
}
