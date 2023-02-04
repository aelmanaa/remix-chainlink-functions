import "./App.css"
import { Context, Plugin } from "./components"

// export const client = new FunctionsPlugin();

const App = () => {
  return (
    <div className="App">
      <Context />
      <hr className="rounded" />
      <Plugin />
    </div>
  )
}

export default App

/**
 *       <Button
        className="btn-sm w-100"
        onClick={async () => await client.transact(null)}
      >
        Click here to transact with {client.contractAddress}
      </Button>
      <Button
        className="btn-sm w-100"
        onClick={async () => await client.transcationWithWeb3(null)}
      >
        Click here to transact directly with Web3provider
      </Button>
      <Button
        className="btn-sm w-100"
        onClick={async () => await client.transactWithEthers(null)}
      >
        Click here to transact directly with Metamask
      </Button>
 */
