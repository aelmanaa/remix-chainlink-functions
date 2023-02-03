import { Form, Alert, Button } from "react-bootstrap"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import { chainNameFromChainId, chainNameFromChainKey } from "../utils"
import { supportedChains } from "../models"

export const Networks = () => {
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const selectedChain = useSelector((state: RootState) => state.chain.value)
  const connected = useSelector((state: RootState) => state.chain.connected)
  const errorMessage = useSelector((state: RootState) => state.chain.errorMessage)

  return (
    <Form.Group>
      <Form.Text className="text-muted">Connected Network: </Form.Text>
      <Form.Text className="text-muted">{chainNameFromChainId(selectedChain)}</Form.Text>
      <Form.Check disabled type="switch" checked={connected && !!selectedAccount} />
      <Form.Select
        size="sm"
        value={chainNameFromChainId(selectedChain)}
        onChange={(event) => {
          event.preventDefault()
          const selectedIndex = event.target.options.selectedIndex
          console.log("aem networks changed", selectedIndex)
          console.log(event.target.options[selectedIndex].getAttribute("data-key"))
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
      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : ""}
    </Form.Group>
  )
}
