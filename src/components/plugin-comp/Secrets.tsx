import { Button } from "react-bootstrap"
import Col from "react-bootstrap/esm/Col"
import Form from "react-bootstrap/esm/Form"
import Row from "react-bootstrap/esm/Row"
import { useSelector } from "react-redux/es/hooks/useSelector"
import { RootState } from "../../redux/store"
import { Secret } from "./Secret"
import { encryptWithPublicKey, cipher, hash } from "eth-crypto"
import { networksData } from "../../data"
import { useDispatch } from "react-redux/es/hooks/useDispatch"
import { setFunctionsConsumerExecuteRequest } from "../../redux/reducers"

export const Secrets = () => {
  const dispatch = useDispatch()
  const numberSecrets = useSelector((state: RootState) => state.functionsConsumer.numberSecrets)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const currentAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  return (
    <div>
      <Row>
        <Col>
          <Form.Label> key: </Form.Label>
        </Col>
        <Col>
          <Form.Label> value: </Form.Label>
        </Col>
      </Row>
      {Array.from({ length: numberSecrets }, (_, index) => (
        <Secret key={index} id={index} />
      ))}
      <Row>
        <Button
          className="btn-warning"
          onClick={async (event) => {
            event.preventDefault()
            const secrets: Record<string, unknown> = {}
            for (let i = 0; i < numberSecrets; i++) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const key = (document.getElementById(`secret-key-${i}`) as any).value
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const value = (document.getElementById(`secret-value-${i}`) as any).value

              if (key && value) {
                secrets[key] = value
              }
            }

            const secretsString = JSON.stringify(secrets)
            const secretsStringHash = hash.keccak256(secretsString)
            const signature = await window.ethereum.request({
              method: "eth_sign",
              params: [currentAccount, secretsStringHash],
            })
            const secretsPayload = {
              message: secretsString,
              signature,
            }

            const pubKey = networksData[chain].functionsPublicKey

            const encrypted = await encryptWithPublicKey(pubKey, JSON.stringify(secretsPayload))
            const secretBuffer = cipher.stringify(encrypted)
            dispatch(
              setFunctionsConsumerExecuteRequest({
                secrets: `0x${secretBuffer}`,
              })
            )
          }}
        >
          Encrypt secrets
        </Button>
      </Row>
    </div>
  )
}
