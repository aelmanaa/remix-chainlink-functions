import chains from "./chains.json"
import reverseChains from "./reverse-chains.json"
import networkConfig from "./network-config.json"
import { CHAINS_DATA, REVERSE_CHAIN_LOOKUP, NETWORKS_DATA } from "../models/data"

export const chainsData = chains as CHAINS_DATA
export const reverseChainLookup = reverseChains as REVERSE_CHAIN_LOOKUP
export const networksData = networkConfig as NETWORKS_DATA
