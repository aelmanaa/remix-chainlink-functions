import Button from "react-bootstrap/esm/Button"
import Form from "react-bootstrap/esm/Form"
import Spinner from "react-bootstrap/esm/Spinner"
import Table from "react-bootstrap/esm/Table"
import CopyToClipboard from "react-copy-to-clipboard"
import { useSelector } from "react-redux"
import { TRANSACTION_STATUS } from "../../models"

import { RootState } from "../../redux/store"
import { formatAmount, formatError, formatRequestId, formatResult, formatStatus, getStatusClassName } from "../../utils"

export const Results = () => {
  const transactions = useSelector((state: RootState) => state.functionsConsumer.transactions)
  return (
    <div>
      <h2>Results</h2>
      {transactions && transactions.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>RequestId</th>
              <th>Status</th>
              <th>Result</th>
              <th>Error</th>
              <th>Total costs(LINK)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              return (
                <tr key={transaction.requestId}>
                  <td>
                    <div className="input-group udapp_nameNbuts">
                      <div className="udapp_titleText input-group-prepend">
                        <Form.Label className="input-group-text">{formatRequestId(transaction.requestId)}</Form.Label>
                      </div>
                      <CopyToClipboard text={transaction.requestId}>
                        <Button className="far fa-copy ml-1 p-2">copy</Button>
                      </CopyToClipboard>
                    </div>
                  </td>
                  <td>
                    {transaction.status === TRANSACTION_STATUS.pending ? (
                      <Spinner animation="border" variant="warning" />
                    ) : (
                      <Form.Label className={`input-group-text ${getStatusClassName(transaction.status)}`}>
                        {formatStatus(transaction.status)}
                      </Form.Label>
                    )}
                  </td>
                  <td>
                    {formatError(transaction.error).toString()
                      ? ""
                      : formatResult(transaction.result, transaction.expectedReturnType)}
                  </td>
                  <td>{transaction.errorCallback ? "error callback" : formatError(transaction.error)}</td>
                  <td>{formatAmount(transaction.totalCost, 6)}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      )}
    </div>
  )
}
