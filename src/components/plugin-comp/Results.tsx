import Button from "react-bootstrap/esm/Button"
import Table from "react-bootstrap/esm/Table"
import CopyToClipboard from "react-copy-to-clipboard"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { formatAmount } from "../../utils"

export const Results = () => {
  const transactions = useSelector((state: RootState) => state.functionsConsumer.transactions)
  return (
    <div>
      <h2>Results</h2>
      {transactions && transactions.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Status</th>
              <th>Result</th>
              <th>Error</th>
              <th>Callback error</th>
              <th>Total costs(LINK)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              return (
                <tr>
                  <td>
                    <div className="input-group udapp_nameNbuts">
                      <div className="udapp_titleText input-group-prepend">
                        <span className="input-group-text udapp_spanTitleText">{transaction.requestId}</span>
                      </div>
                      <div className="btn-group">
                        <CopyToClipboard text={transaction.requestId}>
                          <Button className="p-1 btn-secondary">Copy</Button>
                        </CopyToClipboard>
                      </div>
                    </div>
                  </td>
                  <td>{transaction.status}</td>
                  <td>{transaction.result?.toString()}</td>
                  <td>{transaction.error?.toString()}</td>
                  <td>{transaction.errorCallback}</td>
                  <td>{formatAmount(transaction.totalCost)}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}
    </div>
  )
}
