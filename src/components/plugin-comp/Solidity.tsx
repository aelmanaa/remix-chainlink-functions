import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"

export const Solidity = () => {
  const errorMessage = ""
  return (
    <div>
      <h2>Solidity</h2>
      <Form>
        <Row>
          <Col>
            <Form.Select defaultValue="dfdfg" />
          </Col>
          <Col>
            <Form.Check disabled type="switch" checked={!errorMessage} />
          </Col>
          <Col>
            <Form.Control plaintext readOnly defaultValue={errorMessage || "Compiled!"} />
          </Col>
        </Row>
      </Form>
    </div>
  )
}
