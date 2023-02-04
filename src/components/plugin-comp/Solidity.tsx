import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"

export const Solidity = () => {
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const solidityFiles = Object.keys(compiledSolidityFiles)
  const errorMessage = ""
  return (
    <div>
      <h2>Solidity</h2>
      <Form>
        <Row>
          <Form.Select>
            {solidityFiles.map((opt) => {
              const contracts = compiledSolidityFiles[opt].contracts
              return Object.keys(contracts).map((contract) => {
                return (
                  <option key={opt + "_" + contract} data-key={opt + "_" + contract}>
                    {contract}
                  </option>
                )
              })
            })}
          </Form.Select>
        </Row>
        <Row>
          <Form.Control plaintext readOnly defaultValue={errorMessage || "Compiled!"} />
        </Row>
      </Form>
    </div>
  )
}
