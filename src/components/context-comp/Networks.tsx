import { Form, Alert, Row, Col } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { chainNameFromChainKey, switchChain } from "../../utils"
import { dispatchHandler, supportedChains, SUPPORTED_CHAIN } from "../../models"
import { changeChain } from "../../redux/reducers"
import { chainsData } from "../../data"

export const Networks = () => {
  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const errorMessage = useSelector((state: RootState) => state.chain.errorMessage)

  return (
    <Form.Group>
      <Row>
        <Col>
          <Form.Select
            size="sm"
            className="udapp_contractNames custom-select"
            value={chainNameFromChainKey(chain)}
            onChange={async (event) => {
              event.preventDefault()
              const selectedIndex = event.target.options.selectedIndex
              const chain = event.target.options[selectedIndex].getAttribute("data-key") as SUPPORTED_CHAIN
              await switchChain(chainsData[chain].chainId, dispatchHandler(dispatch, changeChain))
            }}
          >
            {supportedChains.map((opt) => {
              return (
                <option key={opt} data-key={opt}>
                  {chainNameFromChainKey(opt)}
                </option>
              )
            })}
          </Form.Select>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        </Col>
        <Col>
          <Form.Check disabled type="switch" checked={connected && !!selectedAccount} />
        </Col>
      </Row>
    </Form.Group>
  )
}
