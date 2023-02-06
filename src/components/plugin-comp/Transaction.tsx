import { CopyToClipboard } from "react-copy-to-clipboard"
import { useEffect } from "react"
import Button from "react-bootstrap/esm/Button"
import { useSelector, useDispatch } from "react-redux"
import { LOG_TO_REMIX } from "../../models"
import {
  setFunctionsConsumerAddress,
  setFunctionsConsumerExecuteRequest,
  setFunctionsConsumerSubscription,
} from "../../redux/reducers"
import { RootState } from "../../redux/store"
import {
  deployFunctionsConsumer,
  errorsInFile,
  formatAddress,
  getSubscriptionIdOwner,
  getSubscriptionIdBalance,
} from "../../utils"
import { CustomTooltip } from "./CustomTooltip"
import Form from "react-bootstrap/esm/Form"
import { Col, InputGroup, Row } from "react-bootstrap"
import { networksData } from "../../data"

export const Transaction = ({ logToRemixTerminal }: { logToRemixTerminal: LOG_TO_REMIX }) => {
  const dispatch = useDispatch()
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const selectedSolidityContract = useSelector((state: RootState) => state.remix.selectedContract)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const functionsConsumerAddress = useSelector((state: RootState) => state.functionsConsumer.address)
  const sourceFiles = useSelector((state: RootState) => state.remix.sourceFiles)
  useEffect(() => {
    console.log("test")
    if (sourceFiles && Object.keys(sourceFiles).length > 0) {
      dispatch(
        setFunctionsConsumerExecuteRequest({
          sourcePath: Object.keys(sourceFiles)[0],
        })
      )
    }
  }, [
    dispatch,
    chain,
    connected,
    selectedAccount,
    compiledSolidityFiles,
    selectedSolidityContract,
    functionsConsumerAddress,
    sourceFiles,
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
      <Form.Group>
        <Col>
          <Form.Group className="udapp_multiArg">
            <Form.Label htmlFor="consumer-subscriptionId"> subscriptionId: </Form.Label>
            <CustomTooltip
              placement="left-end"
              tooltipId="udappContractActionsTooltip"
              tooltipClasses="text-nowrap"
              tooltipText="subscriptionId"
            >
              <Form.Control
                id="consumer-subscriptionId"
                placeholder="uint64"
                onChange={async (e) => {
                  e.preventDefault()
                  try {
                    const id = parseInt(e.target.value)
                    const registryAddress = networksData[chain].functionsOracleRegistry
                    const balance = await getSubscriptionIdBalance(id, registryAddress)
                    const owner = await getSubscriptionIdOwner(id, registryAddress)
                    dispatch(setFunctionsConsumerSubscription({ id, balance: balance.toHexString(), owner }))
                  } catch (error) {
                    // TODO
                  }
                }}
              />
            </CustomTooltip>
          </Form.Group>
          <Button
            className="btn-warning"
            disabled={disableDeploy()}
            onClick={async (e) => {
              e.preventDefault()
              console.log("aem transaction.tsx", selectedSolidityContract)
              const compiledContract =
                compiledSolidityFiles[selectedSolidityContract.fileName].contracts[
                  selectedSolidityContract.contractName
                ]
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
            Deploy
          </Button>
        </Col>
      </Form.Group>
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
                  <Button className="p-1 btn-secondary">Copy</Button>
                </CopyToClipboard>
              </div>
            </div>
          </div>
          <div className="udapp_cActionsWrapper">
            <div className="udapp_contractActionsContainer">
              <div className="udapp_contractProperty udapp_hasArgs">
                <div className="udapp_contractActionsContainerMulti" style={{ display: "flex" }}>
                  <div className="udapp_contractActionsContainerMultiInner text-dark">
                    <div className="udapp_multiHeader">
                      <div className="udapp_multiTitle run-instance-multi-title pt-3">executeRequest</div>
                      <i className="fas fa-angle-up udapp_methCaret"></i>
                    </div>
                    <Form.Group>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Group className="udapp_multiArg">
                              <Form.Label htmlFor="executeRequest-source"> source: </Form.Label>
                              <CustomTooltip
                                placement="left-end"
                                tooltipId="udappContractActionsTooltip"
                                tooltipClasses="text-nowrap"
                                tooltipText="source"
                              >
                                <Form.Select
                                  className="custom-select"
                                  placeholder="string"
                                  style={{ display: "block" }}
                                  id="executeRequest-source"
                                  onChange={(event) => {
                                    event.preventDefault()
                                    const selectedIndex = event.target.options.selectedIndex
                                    const key = event.target.options[selectedIndex].getAttribute("data-key") as string
                                    dispatch(
                                      setFunctionsConsumerExecuteRequest({
                                        sourcePath: key,
                                      })
                                    )
                                  }}
                                >
                                  {sourceFiles &&
                                    Object.keys(sourceFiles).map((key) => {
                                      return (
                                        <option key={key} data-key={key}>
                                          {sourceFiles[key].fileName}
                                        </option>
                                      )
                                    })}
                                </Form.Select>
                              </CustomTooltip>
                            </Form.Group>
                          </Col>
                          <Col>
                            <Form.Group className="udapp_multiArg">
                              <Form.Label htmlFor="executeRequest-args"> args: </Form.Label>
                              <CustomTooltip
                                placement="left-end"
                                tooltipId="udappContractActionsTooltip"
                                tooltipClasses="text-nowrap"
                                tooltipText="args"
                              >
                                <Form.Control
                                  id="executeRequest-args"
                                  placeholder="string[]"
                                  onChange={(e) => {
                                    e.preventDefault()
                                    try {
                                      const value = JSON.parse(e.target.value) as string[]
                                      dispatch(
                                        setFunctionsConsumerExecuteRequest({
                                          args: value,
                                        })
                                      )
                                    } catch (err) {}
                                  }}
                                />
                              </CustomTooltip>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="udapp_multiArg">
                          <Form.Label htmlFor="executeRequest-secrets"> secrets: </Form.Label>
                          <CustomTooltip
                            placement="left-end"
                            tooltipId="udappContractActionsTooltip"
                            tooltipClasses="text-nowrap"
                            tooltipText="secrets"
                          >
                            <InputGroup.Text id="executeRequest-secrets">bytes</InputGroup.Text>
                          </CustomTooltip>
                        </Form.Group>
                      </Col>
                    </Form.Group>
                    <Col>
                      <Form.Group className="d-flex udapp_group udapp_multiArg">
                        <CustomTooltip
                          placement={"right"}
                          tooltipClasses="text-nowrap"
                          tooltipId="remixUdappInstanceButtonTooltip"
                          tooltipText="executeRequest - transact (not payable)"
                        >
                          <Button
                            onClick={(e) => {
                              // aem todo
                              console.log("aem todo", e)
                            }}
                            className="udapp_instanceButton btn-warning"
                          >
                            transact
                          </Button>
                        </CustomTooltip>
                      </Form.Group>
                    </Col>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
