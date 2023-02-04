import { SUPPORTED_CHAIN } from "."

interface CHAIN_DATA {
  chainId: string
  name: string
  native: string
}

interface NETWORK_DATA {
  linkToken: string
  functionsOracle: string
  functionsOracleRegistry: string
  functionsPublicKey: string
}

export type CHAINS_DATA = Record<SUPPORTED_CHAIN, CHAIN_DATA>
export type REVERSE_CHAIN_LOOKUP = Record<string, SUPPORTED_CHAIN>
export type NETWORKS_DATA = Record<SUPPORTED_CHAIN, NETWORK_DATA>
