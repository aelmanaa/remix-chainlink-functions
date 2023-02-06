import { BigNumberish } from "ethers"

export enum Location {
  Inline = 0,
  Remote = 1,
}

export interface REQUEST {
  secrets?: string
  args?: string[]
  sourcePath?: string
  gasLimit?: number
  secretLocation?: Location
}

export interface SUBSCRIPTION {
  id?: BigNumberish
  balance?: BigNumberish
  owner?: string
}
