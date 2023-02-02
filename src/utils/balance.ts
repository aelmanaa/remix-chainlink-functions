import { BigNumberish, ethers } from "ethers"
import { LinkTokenFactory, compareAccounts } from "."

export const getNativeBalance = async (account: string) => {
  return (await window.ethereum.request({
    method: "eth_getBalance",
    params: [account, "latest"],
  })) as BigNumberish
}

export const registerNativeBalanceEvent = (account: string, handler: (balance: BigNumberish) => void) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const listener: ethers.providers.Listener = async (blockNumber: ethers.providers.BlockTag) => {
    const blockWithTransactions = await provider.getBlockWithTransactions(blockNumber)
    const transactions = blockWithTransactions.transactions
    for (const transaction of transactions) {
      if (compareAccounts(transaction.from, account) || compareAccounts(transaction.to || "", account)) {
        const nativeBalance = await getNativeBalance(account)
        handler(nativeBalance)
      }
    }
  }
  provider.on("block", listener)
  return listener
}

export const clearNativeBalanceEvent = (listener: ethers.providers.Listener) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  provider.removeListener("block", listener)
}

export const getLinkBalance = async (account: string, linkTokenAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const linkToken = LinkTokenFactory.connect(linkTokenAddress, provider)
  const linkBalance = await linkToken.balanceOf(account)
  return linkBalance
}

export const registerLinkEvent = async (
  account: string,
  linkTokenAddress: string,
  handler: (balance: BigNumberish) => void
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const linkToken = LinkTokenFactory.connect(linkTokenAddress, provider)
  linkToken.on("Transfer(address,address,uint256)", async (from, to, value, event) => {
    if (compareAccounts(from, account) || compareAccounts(to, account)) {
      const linkBalance = await getLinkBalance(account, linkTokenAddress)
      handler(linkBalance.toHexString())
    }
  })
}

export const clearLinkEvents = (linkTokenAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const linkToken = LinkTokenFactory.connect(linkTokenAddress, provider)
  linkToken.removeAllListeners()
}
