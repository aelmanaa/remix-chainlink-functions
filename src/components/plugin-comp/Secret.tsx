import Col from "react-bootstrap/esm/Col"
import Form from "react-bootstrap/esm/Form"
import Row from "react-bootstrap/esm/Row"
import { useDispatch } from "react-redux/es/hooks/useDispatch"
import { incrementSecretNumber } from "../../redux/reducers"

export const Secret = ({ id }: { id: number }) => {
  const dispatch = useDispatch()
  return (
    <Row className="mb-1">
      <Col>
        <Form.Control id={`secret-key-${id}`} />
      </Col>
      <Col>
        <Form.Control
          id={`secret-value-${id}`}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              dispatch(incrementSecretNumber())
            }
          }}
        />
      </Col>
    </Row>
  )
}
