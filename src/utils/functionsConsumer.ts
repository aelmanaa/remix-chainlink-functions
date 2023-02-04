import { ethers } from "ethers"
import { networksData } from "../data"
import { SUPPORTED_CHAIN } from "../models"
import { FunctionsConsumerFactory } from "./factory"

export const deploy = async (chain: SUPPORTED_CHAIN) => {
  const oracleAddress = networksData[chain].functionsOracle
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  // const lol = new ethers.ContractFactory(FunctionsConsumerFactory.abi, FunctionsConsumerFactory, signer)
}
