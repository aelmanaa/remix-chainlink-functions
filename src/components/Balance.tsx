import { useEffect } from "react"
import { Table } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../redux/store"
import { changeLinkBalance, changeNativeBalance } from "../redux/reducers"
import { BigNumberish, ethers, utils } from "ethers"
import { chainsData, reverseChainLookup, networksData } from "../data"
import { LinkTokenFactory } from "../utils"

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
        try {
          const provider = new ethers.providers.Web3Provider(ethereum)
          const linkToken = LinkTokenFactory.connect(networksData[reverseChainLookup[chain]].linkToken, provider)
          const linkBalance = await linkToken.balanceOf(selectedAccount)
          console.log("aem linkBalance", linkBalance)
          dispatch(changeLinkBalance(linkBalance.toHexString()))

          /** 
          linkToken.queryFilter(linkToken.filters["Transfer(address,address,uint256)"](), (...data) => {
            console.log(data)
          })
          */

          linkToken.on("Transfer(address,address,uint256)", (from, to, value) => {
            console.log(from, to, value)
          })
        } catch (err) {
          console.error(err)
          dispatch(changeLinkBalance(0))
        }
      } else {
        dispatch(changeNativeBalance(0))
        dispatch(changeLinkBalance(0))
      }
    }
    getBalance()
    return () => {
      // cleanup logic
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const linkToken = LinkTokenFactory.connect(networksData[reverseChainLookup[chain]].linkToken, provider)
        linkToken.removeAllListeners()
      }
    }
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
          <td>{balance.link ? (+utils.formatEther(balance.link)).toFixed(2) : 0} LINK</td>
        </tr>
      </tbody>
    </Table>
  )
}
