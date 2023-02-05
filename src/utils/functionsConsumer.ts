import { ethers } from "ethers"
import { networksData } from "../data"
import { SUPPORTED_CHAIN } from "../models"
import { FunctionsConsumer } from "../types-abis"

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
