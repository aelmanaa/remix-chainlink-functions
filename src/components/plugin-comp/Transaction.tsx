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
  setTransactions,
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
  formatError,
} from "../../utils"
import Form from "react-bootstrap/esm/Form"
import { Col, InputGroup, Row, Tab, Tabs } from "react-bootstrap"
import { networksData } from "../../data"
import { BigNumber, BigNumberish } from "ethers"
import { Secrets } from "."

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
  const initializeTransactionsState = () => {
    dispatch(setFunctionsConsumerAddress(""))
    dispatch(setFunctionsConsumerExecuteRequest({ args: [], secrets: "" }))
    dispatch(setFunctionsConsumerSubscription({}))
    dispatch(setTransactions([]))
  }
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const selectedSolidityContract = useSelector((state: RootState) => state.remix.selectedContract)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const functionsOracleRegistryAddress = useSelector(
    (state: RootState) => networksData[state.chain.chain].functionsOracleRegistry
  )
  const functionsConsumerAddress = useSelector((state: RootState) => state.functionsConsumer.address)
  const subscription = useSelector((state: RootState) => state.functionsConsumer.subscription)
  const transactions = useSelector((state: RootState) => state.functionsConsumer.transactions)
  const request = useSelector((state: RootState) => state.functionsConsumer.request)
  const sourceFiles = useSelector((state: RootState) => state.remix.sourceFiles)

  useEffect(() => {
    if (chain) {
      dispatch(setFunctionsConsumerAddress(""))
      dispatch(setFunctionsConsumerExecuteRequest({}))
      dispatch(setFunctionsConsumerSubscription({}))
      dispatch(setTransactions([]))
    }
  }, [dispatch, chain])
  useEffect(() => {
    if (sourceFiles && Object.keys(sourceFiles).length > 0 && !request.sourcePath) {
      dispatch(
        setFunctionsConsumerExecuteRequest({
          sourcePath: Object.keys(sourceFiles)[0],
        })
      )
    }
    if (transactions && transactions.length > 0) {
      listenToRegistryEvents(functionsOracleRegistryAddress, async (args) => {
        if (transactions.findIndex((element) => element.requestId === (args[0] as string)) === -1) return
        const payload: TRANSACTION = {
          requestId: args[0] as string,
          errorCallback: !(args[5] as boolean),
          totalCost: ((args[4] as BigNumberish) || "").toString(),
        }
        const id = args[1] as string
        if (payload.errorCallback) payload.status = TRANSACTION_STATUS.fail
        dispatch(setTransaction(payload))

        // refresh subscription balance
        const balance = await getSubscriptionIdBalance(id, functionsOracleRegistryAddress)
        dispatch(setFunctionsConsumerSubscription({ balance: balance.toHexString() }))
      })
    }
    return () => {
      clearFunctionsConsumerListeners(functionsConsumerAddress)
      removeAllRegistryListeners(functionsOracleRegistryAddress)
    }
  }, [
    dispatch,
    functionsOracleRegistryAddress,
    functionsConsumerAddress,
    sourceFiles,
    transactions,
    request.sourcePath,
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
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="udapp_multiArg">
                <Form.Label htmlFor="consumer-subscriptionBalance"> subscription balance: </Form.Label>
                <Form.Text id="consumer-subscriptionBalance">{formatAmount(subscription.balance, 6)} LINK</Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="udapp_multiArg">
                <Form.Label htmlFor="consumer-subscriptionOwnerCheck"> are you owner? </Form.Label>
                <Form.Check
                  id="consumer-subscriptionOwnerCheck"
                  disabled
                  type="switch"
                  className="bg-light text-success  fas fa-check"
                  checked={compareAccounts(subscription.owner, selectedAccount)}
                />
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

                functionsConsumer.on("OCRResponse", async (...args) => {
                  await logToRemixTerminal("info", `Request ${args[0]} fulfilled!`)
                  dispatch(
                    setTransaction({
                      requestId: args[0],
                      result: args[1],
                      error: args[2],
                      status: formatError(args[2]) ? TRANSACTION_STATUS.fail : TRANSACTION_STATUS.success,
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
                initializeTransactionsState()
                dispatch(setFunctionsConsumerAddress(functionsConsumer.address))
              } catch (error) {
                await logToRemixTerminal("error", `Error during deployment ${error}`)
                initializeTransactionsState()
              }
            }}
          >
            Deploy
          </Button>
        </Col>
      </Form.Group>
      <h4>Deployed contract</h4>
      {functionsConsumerAddress && (
        <div className="instance udapp_instance udapp_run-instance border-dark">
          <div className="udapp_title pb-0 alert alert-secondary">
            <div className="input-group udapp_nameNbuts">
              <Form.Text className="input-group-text udapp_spanTitleText">
                {selectedSolidityContract.contractName} at {formatAddress(functionsConsumerAddress)}
              </Form.Text>
              <CopyToClipboard text={functionsConsumerAddress}>
                <Button className="p-1 btn-secondary">Copy</Button>
              </CopyToClipboard>
            </div>
          </div>
          <div className="udapp_cActionsWrapper">
            <div className="udapp_contractActionsContainer">
              <div className="udapp_contractProperty udapp_hasArgs">
                <div className="udapp_contractActionsContainerMulti" style={{ display: "flex" }}>
                  <div className="udapp_contractActionsContainerMultiInner text-dark">
                    <div className="udapp_multiHeader">
                      <div className="udapp_multiTitle run-instance-multi-title pt-3">executeRequest</div>
                    </div>
                    <Tabs defaultActiveKey="execute-parameters" className="mb-3">
                      <Tab eventKey="execute-parameters" title="Parameters">
                        <Form.Group>
                          <Col>
                            <Row>
                              <Col>
                                <Form.Group className="udapp_multiArg">
                                  <Form.Label htmlFor="executeRequest-source"> source: </Form.Label>
                                  <Form.Select
                                    className="custom-select"
                                    placeholder="string"
                                    style={{ display: "block" }}
                                    id="executeRequest-source"
                                    value={request.sourcePath ? sourceFiles[request.sourcePath].fileName : ""}
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
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group className="udapp_multiArg">
                                  <Form.Label htmlFor="executeRequest-args"> args: </Form.Label>
                                  <Form.Control
                                    id="executeRequest-args"
                                    placeholder="string[]"
                                    defaultValue={request.args}
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
                                </Form.Group>
                              </Col>
                              <Col>
                                <Form.Group className="udapp_multiArg">
                                  <Form.Label htmlFor="executeRequest-expectedResult"> Response decoder: </Form.Label>
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
                                </Form.Group>
                              </Col>
                            </Row>
                            <Form.Group className="udapp_multiArg">
                              <Form.Label htmlFor="executeRequest-secrets"> secrets: </Form.Label>
                              <InputGroup.Text id="executeRequest-secrets" placeholder="bytes">
                                {request.secrets || ""}
                              </InputGroup.Text>
                            </Form.Group>
                          </Col>
                        </Form.Group>
                      </Tab>
                      <Tab eventKey="execute-secrets" title="Secrets">
                        <Secrets />
                      </Tab>
                    </Tabs>
                    <Col>
                      <Form.Group className="d-flex udapp_group udapp_multiArg">
                        <Button
                          onClick={async (e) => {
                            e.preventDefault()
                            await logToRemixTerminal("info", `Execute request.`)
                            const [requestId, transactionhash] = await executeRequest(
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

                            dispatch(
                              setTransaction({
                                requestId,
                                expectedReturnType: request.expectedReturnType,
                                status: TRANSACTION_STATUS.pending,
                              })
                            )
                          }}
                          className="udapp_instanceButton btn-warning"
                        >
                          transact
                        </Button>
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
