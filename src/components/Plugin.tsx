import { useEffect, useRef } from "react"
import { Button, FormGroup } from "react-bootstrap"
import { Results, Solidity, Transaction } from "./plugin-comp"
import { FunctionsPlugin } from "../remix"
import { useDispatch } from "react-redux"
import { solidityFileCompiled, newSolidityFile, setSourceFiles } from "../redux/reducers"
import { dispatchHandler } from "../models"

export const Plugin = () => {
  const dispatch = useDispatch()

  const client = useRef(new FunctionsPlugin(dispatchHandler(dispatch, solidityFileCompiled)))

  const loadSamples = async () =>
    await client.current.loadSamples(
      dispatchHandler(dispatch, newSolidityFile),
      dispatchHandler(dispatch, setSourceFiles)
    )

  useEffect(() => {
    const currentClient = client.current
    return () => {
      // cleanup logic
      currentClient.removeAllListeners()
    }
  }, [])

  return (
    <div>
      <FormGroup className="border-top border-bottom">
        <Button variant="primary" onClick={loadSamples}>
          Load samples
        </Button>
        <Solidity />
        <Transaction
          logToRemixTerminal={client.current.logToRemixTerminal}
          getFileContent={client.current.getFileContent}
          getJavascriptSources={client.current.getJavascriptSources}
        />
      </FormGroup>
      <Results />
    </div>
  )
}
