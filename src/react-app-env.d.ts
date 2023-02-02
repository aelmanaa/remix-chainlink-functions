/// <reference types="react-scripts" />
import { RequestArguments } from "./models"

declare global {
  interface Window {
    ethereum: import("ethers").providers.ExternalProvider &
      import("ethers").providers.Web3Provider & {
        request: (args: RequestArguments) => Promise<unknown>
        isConnected: () => boolean
      }
  }
}
