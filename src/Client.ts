import { PluginClient } from "@remixproject/plugin"
import { FunctionDescription, RemixTx, RemixTxEvent } from "@remixproject/plugin-api"
import { createClient } from "@remixproject/plugin-webview"
import { ethers } from "ethers"
import { BehaviorSubject } from "rxjs"
import { getSignature, getSignatureString, getTransaction } from "./utils"

export class FunctionsPlugin extends PluginClient {
  callBackEnabled: boolean = true
  feedback = new BehaviorSubject<string>("")
  fileName = new BehaviorSubject<string>("")
  setHelloAbi: FunctionDescription = {
    inputs: [
      {
        name: "_hello",
        type: "string",
      },
    ],
    name: "setHello",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
  byteCode = ""
  contractAddress = ""

  constructor() {
    super()

    createClient(this)
    this.methods = ["debug", "transact", "transactWithEthers", "transcationWithWeb3"]
    this.onload()
      .then(async (x) => {
        await this.setCallBacks()
      })
      .catch(async (e) => {})
  }

  async setCallBacks() {
    let client = this
    console.log("aem methods")
    console.log(client.methods)
    this.on("solidity", "compilationFinished", async (target, source, version, data) => {
      console.log("file name", target)
      client.emit("statusChanged", { key: "none" })
      client.fileName.next(target)
      await client.debug(null)
      console.log("aem compilation")
      if (data) {
        if (data.contracts) {
          const contract = data.contracts[target]
          console.log(contract)

          const compiledContract = contract[Object.keys(contract)[0]] // take the first contract
          console.log(compiledContract)
          const abi = compiledContract.abi
          const evm = compiledContract.evm
          const byteCode = evm.bytecode
          const byteCodeObject = byteCode.object
          client.byteCode = `0x${byteCodeObject}`

          console.log("abi")
          console.log(abi)
          // abi
          const functionSignatureString = getSignatureString(client.setHelloAbi)
          console.log(functionSignatureString)
          const functionSignature = getSignature(functionSignatureString)
          console.log(functionSignature)
          const dataTrans = getTransaction(client.setHelloAbi, ["hello"])
          console.log(dataTrans)
        }
      }
    })

    this.on("network", "providerChanged", async (provider) => {
      console.log("aem provider changed")
      console.log(provider)
      const testaem = await client.call("network", "getNetworkProvider")
      console.log("aem2")
      console.log(testaem)
      console.log("aem3")
      console.log(await client.call("udapp", "getSettings"))
    })

    this.on("udapp", "newTransaction", async (tx: RemixTxEvent, receipt: any) => {
      const accounts = await client.call("udapp", "getAccounts")
      const signerAccount = accounts[0]
      if (tx.from === signerAccount) {
        // filter only transaction via signer account
        console.log("signerAccount", signerAccount)
        console.log("aem")
        console.log("tx")
        console.log(tx)
        console.log("Receipt")
        console.log(receipt)
        const isContractDeployment = receipt.to ? false : true
        const input = tx.input
        if (isContractDeployment && input === client.byteCode) {
          // filter only deployed contracts we are interested in
          client.contractAddress = receipt.contractAddress
          console.log("contract address is", client.contractAddress)
        }
      }
    })

    this.on("udapp", "statusChanged", (status) => {
      console.log("aem status changed")
      console.log(status)
    })
    //const aemTx: RemixTx = {};
    //this.call("udapp", "sendTransaction");

    window.addEventListener(
      "message",
      (event) => {
        if (event.data.target === "metamask-inpage") return
        console.log("remix ide aem event ")
        console.log(event)
        // …
      },
      false
    )
  }

  async transact(input: any) {
    const accounts = await this.call("udapp", "getAccounts")
    const signerAccount = accounts[0]
    const dataTrans = getTransaction(this.setHelloAbi, ["hello" + 100 * Math.random()])
    /*
    const transaction: RemixTx = {
      from: signerAccount,
      to: this.contractAddress,
      data: dataTrans,
      gasLimit: "500000",
      value: "0x00",
      useCall: false,
    };
    */

    const transaction: any = {
      from: signerAccount,
      to: this.contractAddress,
      data: dataTrans,
      gas: "500000",
      value: "0x00",
    }

    console.log("transaction", transaction)
    console.log("send transaction")

    const txReceipt = await this.call("udapp", "sendTransaction", transaction)
    console.log("aem receipt")
    console.log(txReceipt)
  }

  async transactWithEthers(input: any) {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      console.log("please install MetaMask")
      return
    }

    // Request account access if needed
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signerAccount: string[] = (await provider.send("eth_requestAccounts", []))[0]

    const dataTrans = getTransaction(this.setHelloAbi, ["hello" + 100 * Math.random()])
    const param = {
      from: signerAccount,
      to: this.contractAddress,
      data: dataTrans,
      gas: "500000",
      value: "0x00",
    }

    console.log("params transaction", param)
    console.log("send transaction")
    const transactionHash = await provider.send("eth_sendTransaction", [param])
    console.log("transactionHash is " + transactionHash)
  }

  async transcationWithWeb3(input: any) {
    const accounts = await this.call("udapp", "getAccounts")
    const signerAccount = accounts[0]
    const dataTrans = getTransaction(this.setHelloAbi, ["hello" + 100 * Math.random()])
    /*
    const transaction: RemixTx = {
      from: signerAccount,
      to: this.contractAddress,
      data: dataTrans,
      gasLimit: "500000",
      value: "0x00",
      useCall: false,
    };
    */

    const transaction: any = {
      from: signerAccount,
      to: this.contractAddress,
      data: dataTrans,
      gas: "500000",
      value: "0x00",
    }

    console.log("transcationWithWeb3 transaction", transaction)
    console.log("transcationWithWeb3 send transaction")

    const res = await this.call("web3Provider" as any, "sendAsync", transaction)
    console.log("transcationWithWeb3 response")
    console.log(res)
  }

  async debug(res: any) {
    // Get input
    let compilationResult
    if (res) {
      compilationResult = res
    }

    // Process
    this.feedback.next("Compilation success" + res)

    this.emit("statusChanged", {
      key: "succeed",
      type: "success",
      title: "test debug",
    })
  }
}
