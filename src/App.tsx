import "./App.css"
import { Context, Plugin } from "./components"

// export const client = new FunctionsPlugin();

const App = () => {
  return (
    <div className="App">
      <Context />
      <Plugin />
    </div>
  )
}

export default App
