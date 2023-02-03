import { useEffect } from "react"
import { Table } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"
import { changeNativeBalance } from "../redux/reducers"
import { BigNumberish, utils } from "ethers"
import { chainsData, reverseChainLookup } from "../data"

export const Balance = () => {
  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const connected = useSelector((state: RootState) => state.chain.connected)
  const chain = useSelector((state: RootState) => state.chain.value)
  const chainKey = reverseChainLookup[chain]
  const balance = useSelector((state: RootState) => state.balance)

  useEffect(() => {
    const getBalance = async () => {
      if (selectedAccount && connected) {
        const { ethereum } = window

        try {
          const ethBalance = (await ethereum.request({
            method: "eth_getBalance",
            params: [selectedAccount, "latest"],
          })) as BigNumberish
          console.log("aem ethBalance", ethBalance)
          dispatch(changeNativeBalance(ethBalance))
        } catch (err) {
          console.error(err)
          dispatch(changeNativeBalance(0))
        }
      } else {
        dispatch(changeNativeBalance(0))
      }
    }
    getBalance()
  }, [dispatch, selectedAccount, connected, chain])

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
          <td>
            {balance.native ? (+utils.formatEther(balance.native)).toFixed(2) : 0}{" "}
            {chainKey ? chainsData[chainKey].native : ""}
          </td>
          <td>{balance.link ? balance.link.toString() : ""}</td>
        </tr>
      </tbody>
    </Table>
  )
}
