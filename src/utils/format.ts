import { BigNumberish } from "ethers"
import { BytesLike, formatEther } from "ethers/lib/utils"
import { chainsData, reverseChainLookup } from "../data"
import { EXPECTED_RETURN_TYPE, SUPPORTED_CHAIN, TRANSACTION_STATUS } from "../models"
import { Buffer } from "buffer"
window.Buffer = window.Buffer || Buffer

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

export const formatRequestId = (requestId: string | undefined) => {
  if (!requestId) return ""
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  const match = requestId.match(truncateRegex)
  if (!match) return requestId
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

export const formatAmount = (amount: BigNumberish | undefined, decimals?: number) => {
  return amount ? (+formatEther(amount)).toFixed(decimals || 3) : 0
}

export const formatStatus = (status: TRANSACTION_STATUS | undefined) => {
  if (status === undefined) return ""
  switch (Number(status)) {
    case TRANSACTION_STATUS.pending:
      return "pending"
    case TRANSACTION_STATUS.success:
      return "success"
    case TRANSACTION_STATUS.fail:
      return "fail"
  }
}

export const getStatusClassName = (status: TRANSACTION_STATUS | undefined) => {
  if (status === undefined) return ""
  switch (Number(status)) {
    case TRANSACTION_STATUS.pending:
      return ""
    case TRANSACTION_STATUS.success:
      return "text-success"
    case TRANSACTION_STATUS.fail:
      return "text-danger"
  }
}

const signedInt256toBigInt = (hex: string) => {
  const binary = BigInt(hex).toString(2).padStart(256, "0")
  // if the first bit is 0, number is positive
  if (binary[0] === "0") {
    return BigInt(hex)
  }
  return -(BigInt(2) ** BigInt(255)) + BigInt(`0b${binary.slice(1)}`)
}

export const formatResult = (result: BytesLike | undefined, expectedReturn: EXPECTED_RETURN_TYPE | undefined) => {
  if (!result || !result.toString()) return ""
  if (expectedReturn === undefined) return ""
  switch (Number(expectedReturn)) {
    case EXPECTED_RETURN_TYPE.Buffer:
      return result.toString()
    case EXPECTED_RETURN_TYPE.uint256:
      return BigInt("0x" + result.toString().slice(2).slice(-64)).toString()
    case EXPECTED_RETURN_TYPE.int256:
      return signedInt256toBigInt("0x" + result.toString().slice(2).slice(-64)).toString()
    case EXPECTED_RETURN_TYPE.string:
      return Buffer.from(result.toString().slice(2), "hex").toString()
    default:
      return ""
  }
}

export const formatError = (error: BytesLike | undefined) => {
  if (!error || !error.toString()) return ""
  return Buffer.from(error.toString().slice(2), "hex").toString()
}
