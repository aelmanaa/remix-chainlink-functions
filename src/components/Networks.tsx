import { Form, Alert, Button } from "react-bootstrap"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"

const supportedNetworks: string[] = ["Polygon Mumbai"]
const isNetwork = (text: string): string | undefined => {
  if (supportedNetworks.includes(text)) {
    return text as string
  }
  throw new Error("This is not a valid network")
}

export const Networks = () => {
  /*
  const [network, setNetwork] = React.useState<string>("Polygon Mumbai")
  const [busy, setBusy] = React.useState<boolean>(false)
  const [connected, setConnected] = React.useState<boolean>(false)
  */
  const selectedChain = useSelector((state: RootState) => state.chain.value)
  const connected = useSelector((state: RootState) => state.chain.connected)
  const errorMessage = useSelector((state: RootState) => state.chain.errorMessage)
  const network = selectedChain
  const busy = true

  const connect = async (selectedNetwork: string) => {
    console.log("selectedNetwork", selectedNetwork)
  }

  console.log("aem network.tsx connected", connected)

  /*
  const connect = async (selectedNetwork: string) => {
    setBusy(true)
    let isConnected = false
    
    const { isConnected, networkId } = await moonbeamLib.connectMetaMask(
      (accounts: string[]) => {
        setAccount(accounts[0]);
        updateBalance(accounts[0]);
      },
      async (_networkId: number) => {
        await updateBalance(account);
        const name = networkName(_networkId);
        if (name === "Not Moonbeam") {
          setNetwork(selectedNetwork);
        } else {
          setNetwork(name);
        }
      },
      selectedNetwork
    );
    
    setBusy(false)
    // TODO
    isConnected = true
    const networkId = 0
    setNetwork("Polygon Mumbai")
    setConnected(isConnected)
    return { isConnected, networkId }
  }
  */

  return (
    <Form.Group>
      <Form.Text className="text-muted">
        <small>NETWORK </small>
      </Form.Text>
      <Form.Text className="text-muted">
        <small>{selectedChain}</small>
      </Form.Text>
      <Form.Control
        as="select"
        size="lg"
        value={network}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const selectedNetwork = isNetwork(event.target.value)
          if (selectedNetwork) connect(selectedNetwork)
        }}
      >
        {supportedNetworks.map((opt) => {
          return <option key={opt}>{opt}</option>
        })}
      </Form.Control>
      <Button variant="warning" size="sm" disabled={busy || connected} onClick={() => connect(network)}>
        <small>Connect</small>
      </Button>
      <Form.Check disabled type="switch" label="connected" checked={connected} />
      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : ""}
    </Form.Group>
  )
}
