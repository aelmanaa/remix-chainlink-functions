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

export const addConsumerToRegistry = async (
  subscriptionId: BigNumberish,
  consumer: string,
  billingRegistryAddress: string
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const billingRegistry = FunctionsBillingRegistryFactory.connect(billingRegistryAddress, signer)
  await (await billingRegistry.addConsumer(subscriptionId, consumer)).wait()
}

export const listenToRegistryEvents = async (
  billingRegistryAddress: string,
  handler: (args: unknown[]) => Promise<void>
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const billingRegistry = FunctionsBillingRegistryFactory.connect(billingRegistryAddress, provider)
  billingRegistry.on("BillingEnd", async (args) => {
    await handler(args)
  })
}

export const removeAllRegistryListeners = async (billingRegistryAddress: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const billingRegistry = FunctionsBillingRegistryFactory.connect(billingRegistryAddress, provider)
  billingRegistry.removeAllListeners()
}
