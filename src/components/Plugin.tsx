import { useRef } from "react"
import { Button } from "react-bootstrap"
import { FunctionsPlugin } from "../remix"

export const Plugin = () => {
  const client = useRef(new FunctionsPlugin())

  const handleClick = async () => await client.current.loadSamples()

  return (
    <div>
      <p>PLUGIN AEM</p>
      <Button variant="primary" onClick={handleClick}>
        Load samples
      </Button>
    </div>
  )
}
