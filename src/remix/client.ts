import { PluginClient } from "@remixproject/plugin"
import { CompilationResult } from "@remixproject/plugin-api"
import { createClient } from "@remixproject/plugin-webview"
import { COMPILED_CONTRACT, READ_DIR_RESPONSE } from "../models"

export class FunctionsPlugin extends PluginClient {
  private readonly pathSeperator = "/"
  private readonly functionsPath = "chainlink-functions"
  private readonly samplesPath: string
  private readonly soliditySamplesPath: string
  private readonly javascriptSampesPath: string
  private readonly deps = ".deps"
  compiledSolidityFiles: Record<string, { compiled: boolean; path: string; bytecode: string; abi: Array<object> }>
  constructor(onCompileHandler: (payload: { path: string; contracts: Record<string, COMPILED_CONTRACT> }) => void) {
    super()

    createClient(this)
    this.methods = ["loadSamples", "getJavascriptSources"]
    this.samplesPath = this.functionsPath + this.pathSeperator + "samples"
    this.soliditySamplesPath = this.samplesPath + this.pathSeperator + "solidity"
    this.javascriptSampesPath = this.samplesPath + this.pathSeperator + "javascript"
    this.compiledSolidityFiles = {}
    this.onload()
      .then(async (x) => {
        await this.setCallBacks(onCompileHandler)
      })
      .catch(async (err) => {
        // todo
        console.error(err)
      })
  }

  removeAllListeners = async () => {
    this.off("solidity", "compilationFinished")
  }

  loadSamples = async (handler: (path: string) => void) => {
    console.log("aem inside loadSamples")
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
      const solidityFile = this.soliditySamplesPath + this.pathSeperator + key
      const solidityPathRemix = this.deps + this.pathSeperator + solidityFile
      await this.createFile(soliditySamples[key], solidityFile)
      await this.call("solidity", "compile", solidityPathRemix)
      handler(solidityPathRemix)
    }

    for (const key in javascriptSamples) {
      await this.createFile(javascriptSamples[key], this.javascriptSampesPath + this.pathSeperator + key)
    }
  }

  getJavascriptSources = async () => {
    const files = await this.readDir(this.deps + this.pathSeperator + this.javascriptSampesPath)
    for (const key in files) {
      console.log(key, files[key].isDirectory)
    }
  }

  deployConsumer = async (oracleAddress: string) => {
    console.log(oracleAddress)
  }

  private setCallBacks = async (
    onCompileHandler: (payload: { path: string; contracts: Record<string, COMPILED_CONTRACT> }) => void
  ) => {
    this.on("solidity", "compilationFinished", async (target, sources, version, data) => {
      console.log("aem solidity compilationfinished")
      console.log("file target", target)
      console.log("file source", sources)
      console.log("file version", version)
      console.log("file data", data)
      const payload: { path: string; contracts: Record<string, COMPILED_CONTRACT> } = { path: target, contracts: {} }
      for (const contract in data.contracts[target]) {
        payload.contracts[contract] = {
          abi: data.contracts[target][contract].abi,
          bytecode: data.contracts[target][contract].evm.bytecode.object,
        }
      }
      onCompileHandler(payload)
    })
  }

  private createFile = async (link: string, filePath: string) => {
    await this.call("contentImport", "resolveAndSave", link, filePath)
    await this.call("terminal", "log", { type: "info", value: `file ${filePath} imported` })
  }

  private readDir = async (dirPath: string) => {
    console.log("aem files in dirPath ", dirPath)
    const files = (await this.call("fileManager", "readdir", dirPath)) as unknown as READ_DIR_RESPONSE
    console.log("aem files", files)
    return files
  }
}
