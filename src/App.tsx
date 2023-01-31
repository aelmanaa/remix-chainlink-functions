import React from "react";
import Button from "react-bootstrap/Button";
import "./App.css";
import { FunctionsPlugin } from "./Client";
import { useBehaviorSubject } from "./usesubscribe";

export const client = new FunctionsPlugin();

function App() {
  const log = useBehaviorSubject(client.feedback);
  const fileName = useBehaviorSubject(client.fileName);
  return (
    <div className="App">
      <header className="App-header">
        <div>Select a contract, compile it</div>
      </header>
      {fileName ? (
        <div>
          <Button
            className="btn-sm w-100"
            onClick={async () => await client.debug(null)}
          >
            Debug {fileName}
          </Button>
        </div>
      ) : (
        <div></div>
      )}
      <div>aem {log}</div>
      <Button
        className="btn-sm w-100"
        onClick={async () => await client.transact(null)}
      >
        Click here to transact with {client.contractAddress}
      </Button>
    </div>
  );
}

export default App;
