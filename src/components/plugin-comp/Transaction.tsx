import { CopyToClipboard } from "react-copy-to-clipboard"
import { useEffect } from "react"
import Button from "react-bootstrap/esm/Button"
import { useSelector, useDispatch } from "react-redux"
import { LOG_TO_REMIX } from "../../models"
import { setFunctionsConsumerAddress } from "../../redux/reducers"
import { RootState } from "../../redux/store"
import { deployFunctionsConsumer, errorsInFile, formatAddress } from "../../utils"
import { CustomTooltip } from "./CustomTooltip"

const onlyFuncName = ["executeRequest", "latestError", "latestResponse"]

export const Transaction = ({ logToRemixTerminal }: { logToRemixTerminal: LOG_TO_REMIX }) => {
  const dispatch = useDispatch()
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const selectedSolidityContract = useSelector((state: RootState) => state.remix.selectedContract)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const functionsConsumerAddress = useSelector((state: RootState) => state.functionsConsumer.address)
  useEffect(() => {
    console.log("test")
  }, [
    dispatch,
    chain,
    connected,
    selectedAccount,
    compiledSolidityFiles,
    selectedSolidityContract,
    functionsConsumerAddress,
  ])

  const disableDeploy = () => {
    if (!chain) return true
    if (!connected) return true
    if (!selectedAccount) return true
    if (!compiledSolidityFiles || Object.keys(compiledSolidityFiles).length === 0) return true
    if (!selectedSolidityContract || !selectedSolidityContract.contractName || !selectedSolidityContract.fileName)
      return true
    if (!compiledSolidityFiles[selectedSolidityContract.fileName].compiled) return true
    const errors = errorsInFile(compiledSolidityFiles[selectedSolidityContract.fileName])
    if (errors.isError) return true
    return false
  }

  return (
    <div>
      <h2>Deploy & Run transactions</h2>
      <Button
        className="btn-warning"
        disabled={disableDeploy()}
        onClick={async (e) => {
          e.preventDefault()
          console.log("aem transaction.tsx", selectedSolidityContract)
          const compiledContract =
            compiledSolidityFiles[selectedSolidityContract.fileName].contracts[selectedSolidityContract.contractName]
          await logToRemixTerminal(
            "info",
            `Deploy contract ${selectedSolidityContract.contractName} from file ${selectedSolidityContract.fileName}`
          )
          const functionsConsumer = await deployFunctionsConsumer(
            chain,
            compiledContract.abi,
            compiledContract.bytecode
          )
          await logToRemixTerminal(
            "info",
            `Contract ${selectedSolidityContract.contractName} from file ${selectedSolidityContract.fileName} deployed. Address: ${functionsConsumer.address}`
          )
          dispatch(setFunctionsConsumerAddress(functionsConsumer.address))
        }}
      >
        Deploy {selectedSolidityContract.contractName}
      </Button>
      {functionsConsumerAddress && <h4>Deployed contract</h4>}
      {functionsConsumerAddress && (
        <div className="instance udapp_instance udapp_run-instance border-dark">
          <div className="udapp_title pb-0 alert alert-secondary">
            <div className="input-group udapp_nameNbuts">
              <div className="udapp_titleText input-group-prepend">
                <span className="input-group-text udapp_spanTitleText">
                  {selectedSolidityContract.contractName} at {formatAddress(functionsConsumerAddress)}
                </span>
              </div>
              <div className="btn-group">
                <CopyToClipboard text={functionsConsumerAddress}>
                  <button className="btn p-1 btn-secondary">Copy</button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
          <div className="udapp_cActionsWrapper">
            <div className="udapp_contractActionsContainer">
              {compiledSolidityFiles[selectedSolidityContract.fileName].contracts[
                selectedSolidityContract.contractName
              ].abi.map((funcABI, index) => {
                if (funcABI.type !== "function") return null
                if (!onlyFuncName.includes(funcABI.name || "")) return null
                const title = funcABI.name
                let buttonOptions = {
                  title: title + " - call",
                  content: "call",
                  classList: "btn-info",
                  dataId: title + " - call",
                }
                if (funcABI.stateMutability === "payable" || funcABI.payable) {
                  buttonOptions = {
                    title: title + " - transact (payable)",
                    content: "transact",
                    classList: "btn-danger",
                    dataId: title + " - transact (payable)",
                  }
                } else if (funcABI.stateMutability === "nonpayable") {
                  buttonOptions = {
                    title: title + " - transact (not payable)",
                    content: "transact",
                    classList: "btn-warning",
                    dataId: title + " - transact (not payable)",
                  }
                }
                return (
                  <div
                    key={index}
                    className={`udapp_contractProperty ${
                      funcABI.inputs && funcABI.inputs.length > 0 ? "udapp_hasArgs" : ""
                    }`}
                  >
                    <div className="udapp_contractActionsContainerMulti" style={{ display: "flex" }}>
                      <div className="udapp_contractActionsContainerMultiInner text-dark">
                        <div className="udapp_multiHeader">
                          <div className="udapp_multiTitle run-instance-multi-title pt-3">{title}</div>
                          <i className="fas fa-angle-up udapp_methCaret"></i>
                        </div>
                        <div>
                          {funcABI.inputs &&
                            funcABI.inputs.map((inp, index) => {
                              return (
                                <div className="udapp_multiArg" key={index}>
                                  <label htmlFor={inp.name}> {inp.name}: </label>
                                  <CustomTooltip
                                    placement="left-end"
                                    tooltipId="udappContractActionsTooltip"
                                    tooltipClasses="text-nowrap"
                                    tooltipText={inp.name}
                                  >
                                    <input
                                      ref={(el) => {
                                        // todo
                                        // multiFields.current[index] = el
                                        console.log("aem ", el)
                                      }}
                                      className="form-control"
                                      placeholder={inp.type}
                                    />
                                  </CustomTooltip>
                                </div>
                              )
                            })}
                        </div>
                        <div className="d-flex udapp_group udapp_multiArg">
                          <CustomTooltip
                            placement={"right"}
                            tooltipClasses="text-nowrap"
                            tooltipId="remixUdappInstanceButtonTooltip"
                            tooltipText={buttonOptions.title}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                // aem todo
                                console.log("aem todo", e)
                              }}
                              className={`udapp_instanceButton ${buttonOptions.classList}`}
                            >
                              {buttonOptions.content}
                            </button>
                          </CustomTooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
