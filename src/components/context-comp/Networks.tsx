import { Form, Alert } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { chainNameFromChainKey, switchChain } from "../../utils"
import { supportedChains, SUPPORTED_CHAIN } from "../../models"
import { changeChain } from "../../redux/reducers"
import { useEffect } from "react"
import { chainsData } from "../../data"

export const Networks = () => {
  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const errorMessage = useSelector((state: RootState) => state.chain.errorMessage)

  useEffect(() => {
    switchChain(chainsData[chain].chainId)
  }, [chain])

  return (
    <Form.Group>
      <Form.Text className="text-muted">Connected Network: </Form.Text>
      <Form.Text className="text-muted">{chain}</Form.Text>
      <Form.Check disabled type="switch" checked={connected && !!selectedAccount} />

      <Form.Select
        size="sm"
        className="udapp_contractNames custom-select"
        onChange={(event) => {
          event.preventDefault()
          const selectedIndex = event.target.options.selectedIndex
          const chain = event.target.options[selectedIndex].getAttribute("data-key") as SUPPORTED_CHAIN
          dispatch(changeChain(chain))
        }}
      >
        {supportedChains.map((opt) => {
          return (
            <option selected={opt === chain} key={opt} data-key={opt}>
              {chainNameFromChainKey(opt)}
            </option>
          )
        })}
      </Form.Select>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
    </Form.Group>
  )
}
