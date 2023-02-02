import { BigNumberish } from "ethers"

export interface BalanceStateReducer {
  native: BigNumberish
  link: BigNumberish
}
