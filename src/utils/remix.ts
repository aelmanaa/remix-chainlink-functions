import { ABIParameter, FunctionDescription } from "@remixproject/plugin-api"

const inputParametersDeclarationToString = (abiinputs: ABIParameter[]) => {
  // https://github.com/ethereum/remix-project/blob/b2b1bb5f8eacb5d60538d05752656e87c3ec1f75/libs/remix-lib/src/execution/txHelper.ts#L174
  const inputs = (abiinputs || []).map((inp) => inp.type + " " + inp.name)
  return inputs.join(", ")
}

export const getFuncABIInputs = (funABI: FunctionDescription) => {
  // https://github.com/ethereum/remix-project/blob/a8a83db051e6395f5f4e6de37d4b1bf1d52ca37e/apps/remix-ide/src/blockchain/blockchain.js#L321
  // https://github.com/ethereum/remix-project/blob/93d95564777373e1bd003c8413202f69509545f0/libs/remix-ui/run-tab/src/lib/actions/deploy.ts#L315
  if (!funABI.inputs) {
    return ""
  }
  return inputParametersDeclarationToString(funABI.inputs)
}
