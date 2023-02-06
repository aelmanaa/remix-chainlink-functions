import { PluginClient } from "@remixproject/plugin"
import { createClient } from "@remixproject/plugin-webview"
import { COMPILED_FILE, LOG_TO_REMIX, READ_DIR_RESPONSE, SOURCE_FILE } from "../models"

export class FunctionsPlugin extends PluginClient {
  private readonly pathSeperator = "/"
  private readonly functionsPath = "chainlink-functions"
  private readonly samplesPath: string
  private readonly soliditySamplesPath: string
  private readonly javascriptSampesPath: string
  private readonly deps = ".deps"
  compiledSolidityFiles: Record<string, { compiled: boolean; path: string; bytecode: string; abi: Array<object> }>
  constructor(onCompileHandler: (payload: { path: string; compilationResult: COMPILED_FILE }) => void) {
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

  logToRemixTerminal: LOG_TO_REMIX = async (type, value) => {
    await this.call("terminal", "log", { type, value })
  }

  removeAllListeners = async () => {
    this.off("solidity", "compilationFinished")
  }

  loadSamples = async (
    solidityHandler: (path: string) => void,
    sourceFilesHandler: (sourceFiles: Record<string, SOURCE_FILE>) => void
  ) => {
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
      await this.call("terminal", "log", { type: "info", value: `compile ${solidityPathRemix}` })
      await this.call("solidity", "compile", solidityPathRemix)
      solidityHandler(solidityPathRemix)
    }

    for (const key in javascriptSamples) {
      await this.createFile(javascriptSamples[key], this.javascriptSampesPath + this.pathSeperator + key)
    }
    // load source files
    const samples = await this.getJavascriptSources()
    sourceFilesHandler(samples)
  }

  getJavascriptSources = async () => {
    const dirPath = this.deps + this.pathSeperator + this.javascriptSampesPath
    const files = await this.readDir(dirPath)
    const regexp = new RegExp("(" + dirPath + this.pathSeperator + ")(?<fileName>.*).js")
    const samples: Record<string, SOURCE_FILE> = {}
    for (const key in files) {
      if (!files[key].isDirectory) {
        const res = regexp.exec(key)
        if (res?.groups && res.groups.fileName) {
          samples[key] = {
            fileName: res.groups.fileName,
          }
        }
      }
    }
    return samples
  }

  getFileContent = async (path: string) => {
    return await this.call("fileManager", "readFile", path)
  }

  private setCallBacks = async (
    onCompileHandler: (payload: { path: string; compilationResult: COMPILED_FILE }) => void
  ) => {
    this.on("solidity", "compilationFinished", async (target, sources, version, data) => {
      await this.call("terminal", "log", { type: "info", value: `${target} compiled` })
      const payload: { path: string; compilationResult: COMPILED_FILE } = {
        path: target,
        compilationResult: { compiled: true, contracts: {} },
      }
      for (const contract in data.contracts[target]) {
        payload.compilationResult.contracts[contract] = {
          abi: data.contracts[target][contract].abi,
          bytecode: data.contracts[target][contract].evm.bytecode.object,
        }
      }
      if (data.errors) {
        payload.compilationResult.errors = data.errors
      }
      onCompileHandler(payload)
    })
  }

  private createFile = async (link: string, filePath: string) => {
    await this.call("contentImport", "resolveAndSave", link, filePath)
    await this.call("terminal", "log", { type: "info", value: `file ${filePath} imported` })
  }

  private readDir = async (dirPath: string) => {
    const files = (await this.call("fileManager", "readdir", dirPath)) as unknown as READ_DIR_RESPONSE
    return files
  }
}
