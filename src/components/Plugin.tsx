import { useEffect, useRef } from "react"
import { Button } from "react-bootstrap"
import { Solidity } from "./plugin-comp"
import { FunctionsPlugin } from "../remix"
import { useDispatch } from "react-redux"
import { solidityFileCompiled, newSolidityFile } from "../redux/reducers"
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

  const loadSamples = async () => await client.current.loadSamples(handler(dispatch, newSolidityFile))
  const getJavascriptSources = async () => await client.current.getJavascriptSources()

  useEffect(() => {
    const currentClient = client.current
    return () => {
      // cleanup logic
      currentClient.removeAllListeners()
    }
  }, [])

  return (
    <div>
      <Button variant="primary" onClick={loadSamples}>
        Load samples
      </Button>
      <Button variant="primary" onClick={getJavascriptSources}>
        Get javascript sources
      </Button>
      <hr className="rounded" />
      <Solidity />
    </div>
  )
}
