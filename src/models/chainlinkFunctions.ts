import { BigNumberish, BytesLike } from "ethers"

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
  expectedReturnType?: EXPECTED_RETURN_TYPE
}

export interface SUBSCRIPTION {
  id?: BigNumberish
  balance?: BigNumberish
  owner?: string
}

export enum TRANSACTION_STATUS {
  pending,
  success,
  fail,
}

export enum EXPECTED_RETURN_TYPE {
  uint256,
  int256,
  string,
  Buffer,
}

export interface TRANSACTION {
  requestId: string
  status?: TRANSACTION_STATUS
  result?: BytesLike
  error?: BytesLike
  errorCallback?: boolean
  totalCost?: BigNumberish
  expectedReturnType?: EXPECTED_RETURN_TYPE
}
