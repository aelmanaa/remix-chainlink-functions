import { PluginClient } from "@remixproject/plugin"
import { TerminalMessage } from "@remixproject/plugin-api/lib/terminal"
import { createClient } from "@remixproject/plugin-webview"

export class FunctionsPlugin extends PluginClient {
  constructor() {
    super()

    createClient(this)
    this.methods = ["loadSamples"]
    this.onload()
      .then(async (x) => {
        await this.setCallBacks()
      })
      .catch(async (err) => {
        // todo
        console.error(err)
      })
  }

  private setCallBacks = async () => {
    console.log("aem methods")
    console.log(this.methods)
    this.on("solidity", "compilationFinished", async (target, source, version, data) => {
      console.log("file name", target)
    })
  }

  private createFile = async (link: string, filePath: string) => {
    await this.call("contentImport", "resolveAndSave", link, filePath)
    await this.call("terminal", "log", { type: "info", value: `file ${filePath} imported` })
  }

  loadSamples = async () => {
    console.log("aem inside loadSamples")
    const pathSeperator = "/"
    const functionsPath = "chainlink-functions"
    const samplesPath = functionsPath + pathSeperator + "samples"
    const soliditySamplesPath = samplesPath + pathSeperator + "solidity"
    const javascriptSampesPath = samplesPath + pathSeperator + "javascript"
    const soliditySamples: Record<string, string> = {
      "FunctionsConsumer.sol":
        "https://github.com/aelmanaa/ocr2dr-hardhat-starter-kit/blob/remix-samples/remix-samples/solidity/FunctionsConsumer.sol",
    }
    const javascriptSamples: Record<string, string> = {
      "geometric-mean.js":
        "https://github.com/aelmanaa/ocr2dr-hardhat-starter-kit/blob/remix-samples/remix-samples/javascript/geometric-mean.js",
      "get-api.js":
        "https://github.com/aelmanaa/ocr2dr-hardhat-starter-kit/blob/remix-samples/remix-samples/javascript/get-api.js",
    }
    for (const key in soliditySamples) {
      await this.createFile(soliditySamples[key], soliditySamplesPath + pathSeperator + key)
    }

    for (const key in javascriptSamples) {
      await this.createFile(javascriptSamples[key], javascriptSampesPath + pathSeperator + key)
    }
  }
}
