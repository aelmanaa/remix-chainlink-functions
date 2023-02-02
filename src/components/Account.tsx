import { Form, Alert } from "react-bootstrap"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"

export const Account = () => {
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const errorMessage = useSelector((state: RootState) => state.account.errorMessage)

  return (
    <Form.Group>
      <Form.Text className="text-muted">
        <small>Connected account </small>
      </Form.Text>
      <Form.Text className="text-muted">
        <small>{selectedAccount}</small>
      </Form.Text>
      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : ""}
    </Form.Group>
  )
}
