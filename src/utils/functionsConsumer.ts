import { ethers } from "ethers"
import { networksData } from "../data"
import { SUPPORTED_CHAIN } from "../models"
import { FunctionsConsumer } from "../types-abis"
import { FunctionsConsumerFactory } from "./factory"

export const deployFunctionsConsumer = async (
  chain: SUPPORTED_CHAIN,
  functionConsumerAbi: ethers.ContractInterface,
  functionsConsumerBytecode: ethers.utils.BytesLike | { object: string }
) => {
  const oracleAddress = networksData[chain].functionsOracle
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contractFactory = new ethers.ContractFactory(functionConsumerAbi, functionsConsumerBytecode, signer)
  const functionsConsumer = (await (await contractFactory.deploy(oracleAddress)).deployed()) as FunctionsConsumer
  return functionsConsumer
}

export const clearFunctionsConsumerListeners = async (functionsConsumerAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const functionsConsumer = FunctionsConsumerFactory.connect(functionsConsumerAddress, provider)
  functionsConsumer.removeAllListeners()
}

export const executeRequest = async (
  functionsConsumerAddress: string,
  source: string,
  secrets: ethers.utils.BytesLike,
  args: string[],
  subscriptionId: ethers.BigNumberish,
  gasLimit: ethers.BigNumberish
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const functionsConsumer = FunctionsConsumerFactory.connect(functionsConsumerAddress, signer)
  const receipt = await (await functionsConsumer.executeRequest(source, secrets, args, subscriptionId, gasLimit)).wait()
  return receipt.transactionHash
}
