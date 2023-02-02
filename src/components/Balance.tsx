import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import { utils } from "ethers"

export const Balance = () => {
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const connected = useSelector((state: RootState) => state.chain.connected)
  // TODO
  const [balance, setBalance] = useState({
    eth: "",
    link: "",
  })

  useEffect(() => {
    console.log("aem useEffect Balance fired")
    const getBalance = async () => {
      console.log("getBalance IN")
      if (selectedAccount && connected) {
        const { ethereum } = window

        try {
          const ethBalance = (await ethereum.request({
            method: "eth_getBalance",
            params: [selectedAccount, "latest"],
          })) as string
          console.log("aem ethBalance", ethBalance)
          setBalance({ eth: ethBalance, link: "" })
        } catch (err) {
          console.error(err)
          setBalance({ eth: "", link: "" })
        }
      } else {
        setBalance({ eth: "", link: "" })
      }
    }
    getBalance()
  }, [selectedAccount, connected])

  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th></th>
          <th>Native</th>
          <th>LINK</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Current Balance</td>
          <td>{balance.eth ? (+utils.formatEther(balance.eth)).toFixed(2) : 0} ETH</td>
          <td>{balance.link}</td>
        </tr>
      </tbody>
    </Table>
  )
}
