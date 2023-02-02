import { useEffect } from "react"
import { Table } from "react-bootstrap"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { changeLinkBalance, changeNativeBalance } from "../../redux/reducers"
import { BigNumberish } from "ethers"
import { chainsData, networksData } from "../../data"
import {
  clearLinkEvents,
  clearNativeBalanceEvent,
  formatAmount,
  getLinkBalance,
  getNativeBalance,
  registerLinkEvent,
  registerNativeBalanceEvent,
} from "../../utils"

export const Balance = () => {
  const dispatch = useDispatch()
  const selectedAccount = useSelector((state: RootState) => state.account.value.selectedAccount)
  const connected = useSelector((state: RootState) => state.chain.chainConnected)
  const chain = useSelector((state: RootState) => state.chain.chain)
  const balance = useSelector((state: RootState) => state.balance)

  useEffect(() => {
    const getBalance = async () => {
      try {
        const ethBalance = await getNativeBalance(selectedAccount)
        dispatch(changeNativeBalance(ethBalance))
      } catch (err) {
        console.error(err)
        dispatch(changeNativeBalance(0))
      }
      try {
        const linkBalance = await getLinkBalance(selectedAccount, networksData[chain].linkToken)
        dispatch(changeLinkBalance(linkBalance.toHexString()))
      } catch (err) {
        console.error(err)
        dispatch(changeLinkBalance(0))
      }
    }
    if (selectedAccount && connected) {
      getBalance()
      registerLinkEvent(selectedAccount, networksData[chain].linkToken, (linkBalance: BigNumberish) => {
        dispatch(changeLinkBalance(linkBalance))
      })
      const nativeBalanceListner = registerNativeBalanceEvent(selectedAccount, (nativeBalance: BigNumberish) => {
        dispatch(changeNativeBalance(nativeBalance))
      })
      return () => {
        clearLinkEvents(networksData[chain].linkToken)
        clearNativeBalanceEvent(nativeBalanceListner)
      }
    } else {
      dispatch(changeNativeBalance(0))
      dispatch(changeLinkBalance(0))
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
            {formatAmount(balance.native)} {chain ? chainsData[chain].native : ""}
          </td>
          <td>{formatAmount(balance.link)} LINK</td>
        </tr>
      </tbody>
    </Table>
  )
}
