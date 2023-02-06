import { useEffect, useRef } from "react"
import { Button, FormGroup } from "react-bootstrap"
import { Solidity, Transaction } from "./plugin-comp"
import { FunctionsPlugin } from "../remix"
import { useDispatch } from "react-redux"
import { solidityFileCompiled, newSolidityFile, setSourceFiles } from "../redux/reducers"
import { AnyAction, Dispatch } from "redux"
import { ActionCreatorWithPayload } from "@reduxjs/toolkit"

export const Plugin = () => {
  const dispatch = useDispatch()
  const handler = <T,>(dispatcher: Dispatch<AnyAction>, reducer: ActionCreatorWithPayload<T>) => {
    return (payload: T) => {
      dispatcher(reducer(payload))
    }
  }
  const client = useRef(new FunctionsPlugin(handler(dispatch, solidityFileCompiled)))

  const loadSamples = async () =>
    await client.current.loadSamples(handler(dispatch, newSolidityFile), handler(dispatch, setSourceFiles))
  const getJavascriptSources = async () => await client.current.getJavascriptSources()

  useEffect(() => {
    const currentClient = client.current
    return () => {
      // cleanup logic
      currentClient.removeAllListeners()
    }
  }, [])

  return (
    <FormGroup className="border-top border-bottom">
      <Button variant="primary" onClick={loadSamples}>
        Load samples
      </Button>
      <Solidity />
      <Transaction logToRemixTerminal={client.current.logToRemixTerminal} />
    </FormGroup>
  )
}
