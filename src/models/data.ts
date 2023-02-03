import { SUPPORTED_CHAINS } from "."

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

export type CHAINS_DATA = Record<SUPPORTED_CHAINS, CHAIN_DATA>
export type REVERSE_CHAIN_LOOKUP = Record<string, SUPPORTED_CHAINS>
export type NETWORKS_DATA = Record<SUPPORTED_CHAINS, NETWORK_DATA>

/**
 * 
 * 
 * {
  "POLYGON_MUMBAI": {
    "linkToken": "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    "functionsOracle": "0x6199175d137B791B7AB06C3452aa6acc3519b254",
    "functionsOracleRegistry": "0xB12044Ba63F66191E53b0Cd8C10095080b4c8434",
    "functionsPublicKey": "f2f9c47363202d89aa9fa70baf783d70006fe493471ac8cfa82f1426fd09f16a5f6b32b7c4b5d5165cd147a6e513ba4c0efd39d969d6b20a8a21126f0411b9c6"
  },
  "ETHEREUM_GOERLI": {
    "linkToken": "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
    "functionsOracle": "0xeB6863217327B044Ac3380D4122b32951377389A",
    "functionsOracleRegistry": "0x510edc20c85B414e765A14fE3d6D3909d2e204a0",
    "functionsPublicKey": "f2f9c47363202d89aa9fa70baf783d70006fe493471ac8cfa82f1426fd09f16a5f6b32b7c4b5d5165cd147a6e513ba4c0efd39d969d6b20a8a21126f0411b9c6"
  }
}
 */
