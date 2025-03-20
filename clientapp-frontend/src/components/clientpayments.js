import React, { useState, useEffect } from 'react';

const ClientPayments = ({ clientData }) => {
  const [payments, setPayments] = useState(clientData.payments || {});
  const [updatedPayments, setUpdatedPayments] = useState({});

  useEffect(() => {
    setUpdatedPayments(payments);
  }, [payments]);

  const handlePaymentChange = (year, month, newAmount) => {
    setUpdatedPayments((prevState) => {
      const updatedYear = { ...prevState[year] };
      const fixedAmount = clientData.fixedAmount;

      // Get the existing month data or initialize an empty object if not available
      const previousMonthData = updatedYear[month] || {
        amount: 0,
        isPaid: false,
        balance: fixedAmount, // Set initial balance as fixedAmount
      };

      // Calculate the remaining balance after entering the new payment
      const remainingBalance = previousMonthData.balance - newAmount;

      // Update the status based on the remaining balance (if balance is 0, it is paid)
      updatedYear[month] = {
        ...previousMonthData,
        amount: newAmount,
        balance: remainingBalance >= 0 ? remainingBalance : 0, // Prevent negative balance
        isPaid: remainingBalance <= 0, // If the remaining balance is 0 or negative, the payment is done
      };

      return {
        ...prevState,
        [year]: updatedYear,
      };
    });
  };

  const handleSave = async () => {
    try {
      // Send the updated payments to the backend
      const response = await fetch('/api/updatePayments', {
        method: 'POST',
        body: JSON.stringify(updatedPayments),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('Updated Payments:', data);
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  };

  return (
    <div>
      <h2>Client Payments</h2>
      {Object.keys(payments).map((year) => (
        <div key={year}>
          <h3>{year}</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount Paid</th>
                <th>Status</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(payments[year]).map((month) => {
                const { amount, balance, isPaid } = updatedPayments[year]?.[month] || {};
                return (
                  <tr key={month}>
                    <td>{month}</td>
                    <td>
                      <input
                        type="number"
                        value={amount || 0}
                        onChange={(e) =>
                          handlePaymentChange(year, month, Number(e.target.value))
                        }
                      />
                    </td>
                    <td>
                      {isPaid ? '✅' : '❌'}
                    </td>
                    <td>
                      Balance: {balance !== undefined ? balance : clientData.fixedAmount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={handleSave}>Save</button>
        </div>
      ))}
    </div>
  );
};

export default ClientPayments;
