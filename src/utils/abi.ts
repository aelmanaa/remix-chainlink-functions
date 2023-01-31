import { ethers } from "ethers";
import { FunctionDescription } from "@remixproject/plugin-api";

/**
 * Get the string function signature from function abi
 * Example: `{
		"inputs": [],
		"name": "getCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}` returns getCount()
 * @param funcAbi  
 * @returns string function signature
 */
export const getSignatureString = (funcAbi: FunctionDescription) => {
  if (funcAbi.type !== "function")
    throw new Error(`${JSON.stringify(funcAbi)} is not a function`);
  const inputTypes = (funcAbi.inputs || []).map((input) => input.type);
  return `${funcAbi.name || ""}(${inputTypes.join(",")})`;
};

/**
 *  Encode the hex function signature
 *  Use `ethers.utils.id` to compute the KECCAK256 hash
 * @param signatureString function signature in string (e.g., transfer(address recipient, uint256 amount))
 * @returns Hexadecimal function signature
 */
export const getSignature = (signatureString: string) => {
  return ethers.utils.id(signatureString).slice(0, 10);
};

export const getTransaction = (funcAbi: FunctionDescription, args: any[]) => {
  const { defaultAbiCoder } = ethers.utils;
  if (args.length === 0 && funcAbi.inputs)
    throw new Error(`Inputs ${funcAbi.inputs} expected. Provide arguments`);
  if (args.length > 0 && !funcAbi.inputs)
    throw new Error(
      `Arguments ${args} provided. Function ${JSON.stringify(
        funcAbi
      )} does not expect arguments`
    );
  if (args.length !== funcAbi.inputs?.length)
    throw new Error(
      `Arguments length ${args} and Function parameters length ${JSON.stringify(
        funcAbi
      )} don't match`
    );

  const sig = getSignature(getSignatureString(funcAbi));
  const encodedArgs = funcAbi.inputs
    ? defaultAbiCoder.encode(
        funcAbi.inputs.map((inp) => inp.type),
        args
      )
    : "";

  return `${sig}${encodedArgs.slice(2)}`;
};
