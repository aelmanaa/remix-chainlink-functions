import { useEffect } from "react"
import Form from "react-bootstrap/Form"
import { useSelector, useDispatch } from "react-redux"
import { selectContract } from "../../redux/reducers"
import { RootState } from "../../redux/store"
import { errorsInFile } from "../../utils"

export const Solidity = () => {
  const dispatch = useDispatch()
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const selectedContract = useSelector((state: RootState) => state.remix.selectedContract)
  const solidityFiles = Object.keys(compiledSolidityFiles)

  const file = compiledSolidityFiles[selectedContract.fileName]
  const compiled = file ? file.compiled : false
  const errors = errorsInFile(file)
  const isError = errors.isError
  const errorMessages: string[] = errors.errorMessages

  useEffect(() => {
    if (compiledSolidityFiles && Object.keys(compiledSolidityFiles).length > 0) {
      const fileName = Object.keys(compiledSolidityFiles)[0]
      const contractName = Object.keys(compiledSolidityFiles[fileName].contracts)[0]
      dispatch(selectContract({ fileName, contractName }))
    }
  }, [dispatch, compiledSolidityFiles])

  return (
    <Form.Group>
      <h2>Compiler</h2>
      <Form>
        <Form.Group style={{ display: "flex", flexDirection: "row" }}>
          <Form.Select
            className="udapp_contractNames custom-select"
            style={{ display: "block" }}
            value={selectedContract.fileName + "_+_" + selectedContract.contractName}
            onChange={(event) => {
              event.preventDefault()
              const selectedIndex = event.target.options.selectedIndex
              const key = event.target.options[selectedIndex].getAttribute("data-key") as string
              const [fileName, contractName] = key.split("_+_")
              dispatch(selectContract({ fileName, contractName }))
            }}
          >
            {solidityFiles.map((fileName, index1) => {
              const compiledFile = compiledSolidityFiles[fileName]
              const contracts = compiledFile.contracts
              // errorsInFile
              return Object.keys(contracts).map((contractName, index2) => {
                return (
                  <option key={fileName + "_+_" + contractName} data-key={fileName + "_+_" + contractName}>
                    {contractName}
                  </option>
                )
              })
            })}
          </Form.Select>
          {compiled ? (
            isError ? (
              <Form.Control plaintext readOnly defaultValue="Compiled with errors!" />
            ) : (
              <Form.Control plaintext readOnly defaultValue="Compiled!" />
            )
          ) : (
            ""
          )}
        </Form.Group>
      </Form>
      {isError ? <h3>Compilation Errors</h3> : ""}
      {isError
        ? errorMessages.map((message, index) => {
            return <Form.Control key={`compilation_error_${index}`} plaintext readOnly defaultValue={message} />
          })
        : ""}
    </Form.Group>
  )
}
