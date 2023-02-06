import { BigNumberish } from "ethers"
import { formatEther } from "ethers/lib/utils"
import { chainsData, reverseChainLookup } from "../data"
import { SUPPORTED_CHAIN } from "../models"

export const compareAccounts = (accountA: string | undefined, accountB: string | undefined) => {
  if (!accountA || !accountB) return false
  if (accountA.toLowerCase() !== accountB.toLowerCase()) return false
  return true
}

export const formatAddress = (account: string | undefined) => {
  if (!account) return ""
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  const match = account.match(truncateRegex)
  if (!match) return account
  return `${match[1]}…${match[2]}`
}

export const formatTransactionHash = (hash: string | undefined) => {
  if (!hash) return ""
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  const match = hash.match(truncateRegex)
  if (!match) return hash
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

export const formatAmount = (amount: BigNumberish | undefined) => {
  return amount ? (+formatEther(amount)).toFixed(3) : 0
}
