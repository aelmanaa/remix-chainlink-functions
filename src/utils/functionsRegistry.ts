import { BigNumberish, ethers } from "ethers"
import { FunctionsBillingRegistryFactory } from "./factory"

export const getSubscriptionIdBalance = async (subscriptionId: BigNumberish, billingRegistryAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const billingRegistry = FunctionsBillingRegistryFactory.connect(billingRegistryAddress, provider)
  const balance = (await billingRegistry.getSubscription(subscriptionId)).balance
  return balance
}

export const getSubscriptionIdOwner = async (subscriptionId: BigNumberish, billingRegistryAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const billingRegistry = FunctionsBillingRegistryFactory.connect(billingRegistryAddress, provider)
  const owner = await billingRegistry.getSubscriptionOwner(subscriptionId)
  return owner
}
