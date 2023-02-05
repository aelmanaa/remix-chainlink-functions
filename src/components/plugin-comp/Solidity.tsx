import Form from "react-bootstrap/Form"
import { useSelector, useDispatch } from "react-redux"
import { selectContract } from "../../redux/reducers"
import { RootState } from "../../redux/store"
import { errorsInFile } from "../../utils"

export const Solidity = () => {
  const dispatch = useDispatch()
  const compiledSolidityFiles = useSelector((state: RootState) => state.remix.compiledSolidityFiles)
  const solidityFiles = Object.keys(compiledSolidityFiles)

  let compiled = false
  let isError = false
  let errorMessages: string[] = []

  const refreshDisplayData = (selectedFile: string) => {
    const file = compiledSolidityFiles[selectedFile]
    const errors = errorsInFile(file)
    compiled = file.compiled
    isError = errors.isError
    errorMessages = errors.errorMessages
  }

  return (
    <div className="border-top border-bottom">
      <h2>Compiler</h2>
      <Form>
        <Form.Group style={{ display: "flex", flexDirection: "row" }}>
          <Form.Select
            className="udapp_contractNames custom-select"
            style={{ display: "block" }}
            onChange={(event) => {
              event.preventDefault()
              const selectedIndex = event.target.options.selectedIndex
              const key = event.target.options[selectedIndex].getAttribute("data-key") as string
              const [fileName, contractName] = key.split("_+_")
              refreshDisplayData(fileName)
              dispatch(selectContract({ fileName, contractName }))
            }}
          >
            {solidityFiles.map((fileName, index1) => {
              if (index1 === 0) refreshDisplayData(fileName)
              const compiledFile = compiledSolidityFiles[fileName]
              const contracts = compiledFile.contracts
              // errorsInFile
              return Object.keys(contracts).map((contractName, index2) => {
                if (index1 === 0 && index2 === 0) dispatch(selectContract({ fileName, contractName }))
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
    </div>
  )
}
