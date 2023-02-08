import { CopyToClipboard } from "react-copy-to-clipboard"
import { useEffect } from "react"
import Button from "react-bootstrap/esm/Button"
import { useSelector, useDispatch } from "react-redux"
import {
  EXPECTED_RETURN_TYPE,
  Location,
  LOG_TO_REMIX,
  SOURCE_FILE,
  TRANSACTION,
  TRANSACTION_STATUS,
} from "../../models"
import {
  setFunctionsConsumerAddress,
  setFunctionsConsumerExecuteRequest,
  setFunctionsConsumerSubscription,
  setSourceFiles,
  setTransaction,
} from "../../redux/reducers"
import { RootState } from "../../redux/store"
import {
  deployFunctionsConsumer,
  errorsInFile,
  formatAddress,
  getSubscriptionIdOwner,
  getSubscriptionIdBalance,
  formatAmount,
  compareAccounts,
  addConsumerToRegistry,
  executeRequest,
  clearFunctionsConsumerListeners,
  removeAllRegistryListeners,
  listenToRegistryEvents,
} from "../../utils"
import { CustomTooltip } from "./CustomTooltip"
import Form from "react-bootstrap/esm/Form"
import { Col, InputGroup, Row } from "react-bootstrap"
import { networksData } from "../../data"
import { BigNumber, BigNumberish } from "ethers"

export const Transaction = ({
  logToRemixTerminal,
  getFileContent,
  getJavascriptSources,
}: {
  logToRemixTerminal: LOG_TO_REMIX
  getFileContent: (path: string) => Promise<string>
  getJavascriptSources: () => Promise<Record<string, SOURCE_FILE>>
}) => {
  const dispatch = useDispatch()
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const selectedSolidityContract = useSelector((state: RootState) => state.remix.selectedContract)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const functionsConsumerAddress = useSelector((state: RootState) => state.functionsConsumer.address)
  const subscription = useSelector((state: RootState) => state.functionsConsumer.subscription)
  const transactions = useSelector((state: RootState) => state.functionsConsumer.transactions)
  const request = useSelector((state: RootState) => state.functionsConsumer.request)
  const sourceFiles = useSelector((state: RootState) => state.remix.sourceFiles)
  useEffect(() => {
    if (sourceFiles && Object.keys(sourceFiles).length > 0) {
      dispatch(
        setFunctionsConsumerExecuteRequest({
          sourcePath: Object.keys(sourceFiles)[0],
        })
      )
    }
    if (transactions && transactions.length > 0) {
      listenToRegistryEvents(networksData[chain].functionsOracleRegistry, async (args) => {
        if (transactions.findIndex((element) => element.requestId === (args[0] as string)) === -1) return
        const payload: TRANSACTION = {
          requestId: args[0] as string,
          errorCallback: !(args[5] as boolean),
          totalCost: ((args[4] as BigNumberish) || "").toString(),
        }
        if (args[5] as boolean) payload.status = TRANSACTION_STATUS.fail
        dispatch(setTransaction(payload))
      })
    }
    return () => {
      clearFunctionsConsumerListeners(functionsConsumerAddress)
      removeAllRegistryListeners(networksData[chain].functionsOracleRegistry)
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
    subscription,
    transactions,
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
    // check subscription
    if (
      !subscription ||
      !subscription.id ||
      !compareAccounts(subscription.owner, selectedAccount) ||
      !BigNumber.from(subscription.balance || 0).gt(BigNumber.from(0))
    )
      return true

    return false
  }

  return (
    <div>
      <h2>Deploy & Run transactions</h2>
      <Form.Group>
        <Col>
          <Row>
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
                        dispatch(setFunctionsConsumerSubscription({ balance: 0, owner: "" }))
                      }
                    }}
                  />
                </CustomTooltip>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="udapp_multiArg">
                <Form.Label htmlFor="consumer-subscriptionBalance"> subscription balance: </Form.Label>
                <CustomTooltip
                  placement="left-end"
                  tooltipId="udappContractActionsTooltip"
                  tooltipClasses="text-nowrap"
                  tooltipText="subscriptionBalance"
                >
                  <Form.Control
                    id="consumer-subscriptionBalance"
                    readOnly
                    defaultValue=""
                    value={formatAmount(subscription.balance)}
                  />
                </CustomTooltip>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="udapp_multiArg">
                <Form.Label htmlFor="consumer-subscriptionOwnerCheck"> are you owner? </Form.Label>
                <CustomTooltip
                  placement="left-end"
                  tooltipId="udappContractActionsTooltip"
                  tooltipClasses="text-nowrap"
                  tooltipText="subscriptionCheckOwner"
                >
                  <Form.Check
                    id="consumer-subscriptionOwnerCheck"
                    disabled
                    type="switch"
                    className="bg-light text-success  fas fa-check"
                    checked={compareAccounts(subscription.owner, selectedAccount)}
                  />
                </CustomTooltip>
              </Form.Group>
            </Col>
          </Row>
          <Button
            className="btn-warning"
            disabled={disableDeploy()}
            onClick={async (e) => {
              e.preventDefault()
              const compiledContract =
                compiledSolidityFiles[selectedSolidityContract.fileName].contracts[
                  selectedSolidityContract.contractName
                ]
              try {
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
                functionsConsumer.on("RequestSent", (requestId) => {
                  dispatch(
                    setTransaction({
                      requestId,
                      expectedReturnType: request.expectedReturnType,
                      status: TRANSACTION_STATUS.pending,
                    })
                  )
                })
                functionsConsumer.on("OCRResponse", async (...args) => {
                  await logToRemixTerminal("info", `Request ${args[0]} fulfilled!`)
                  dispatch(
                    setTransaction({
                      requestId: args[0],
                      result: args[1],
                      error: args[2],
                      status: args[1] ? TRANSACTION_STATUS.success : TRANSACTION_STATUS.fail,
                    })
                  )
                })
                await logToRemixTerminal(
                  "info",
                  `Add consumer: ${functionsConsumer.address} to subscription ${subscription.id}`
                )
                if (subscription.id) {
                  await addConsumerToRegistry(
                    subscription.id,
                    functionsConsumer.address,
                    networksData[chain].functionsOracleRegistry
                  )
                  await logToRemixTerminal(
                    "info",
                    `Consumer: ${functionsConsumer.address} added to subscription ${subscription.id}`
                  )
                }

                dispatch(setFunctionsConsumerAddress(functionsConsumer.address))
              } catch (error) {
                await logToRemixTerminal("error", `Error during deployment ${error}`)
                dispatch(setFunctionsConsumerAddress(""))
              }
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
                                  onClick={async (event) => {
                                    event.preventDefault()
                                    const samples = await getJavascriptSources()
                                    dispatch(setSourceFiles(samples))
                                  }}
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
                          <Col>
                            <Form.Group className="udapp_multiArg">
                              <Form.Label htmlFor="executeRequest-expectedResult"> Response decoder: </Form.Label>
                              <CustomTooltip
                                placement="left-end"
                                tooltipId="udappContractActionsTooltip"
                                tooltipClasses="text-nowrap"
                                tooltipText="expectedResult"
                              >
                                <Form.Select
                                  className="custom-select"
                                  style={{ display: "block" }}
                                  id="executeRequest-expectedResult"
                                  onChange={(event) => {
                                    event.preventDefault()
                                    const selectedIndex = event.target.options.selectedIndex
                                    const key = event.target.options[selectedIndex].getAttribute(
                                      "data-key"
                                    ) as unknown as EXPECTED_RETURN_TYPE
                                    dispatch(
                                      setFunctionsConsumerExecuteRequest({
                                        expectedReturnType: key,
                                      })
                                    )
                                  }}
                                >
                                  {Object.keys(EXPECTED_RETURN_TYPE).map((key) => {
                                    const keyNum = Number(key)
                                    if (!isNaN(keyNum))
                                      return (
                                        <option key={keyNum} data-key={keyNum}>
                                          {EXPECTED_RETURN_TYPE[keyNum]}
                                        </option>
                                      )
                                    return null
                                  })}
                                </Form.Select>
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
                            onClick={async (e) => {
                              e.preventDefault()
                              await logToRemixTerminal("info", `Execute request.`)
                              const transactionhash = await executeRequest(
                                functionsConsumerAddress,
                                await getFileContent(request.sourcePath || ""),
                                request.secrets || "",
                                request.secretLocation || Location.Inline,
                                request.args || [""],
                                subscription.id || "",
                                100_000
                              )
                              await logToRemixTerminal(
                                "info",
                                `Execute request successful. transaction hash: ${transactionhash}`
                              )
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
