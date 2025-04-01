import React, { useState, useEffect } from 'react';

const ClientPayments = ({ clientId, clientData }) => {
  const [payments, setPayments] = useState({});
  const [updatedPayments, setUpdatedPayments] = useState({});

  // Fetch client payment data
  const fetchPayments = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://client-app-6.onrender.comclients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setPayments(data.payments || {});
      setUpdatedPayments(data.payments || {});
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [clientId]);

  // Handle input change
  const handlePaymentChange = (year, month, newAmount) => {
    setUpdatedPayments((prevState) => {
      const updatedYear = { ...prevState[year] };
      const fixedAmount = clientData.fixedAmount;

      const previousMonthData = updatedYear[month] || {
        amount: 0,
        isPaid: false,
        balance: fixedAmount,
      };

      const remainingBalance = fixedAmount - newAmount;

      updatedYear[month] = {
        ...previousMonthData,
        amount: newAmount,
        balance: remainingBalance >= 0 ? remainingBalance : 0,
        isPaid: remainingBalance <= 0,
      };

      return {
        ...prevState,
        [year]: updatedYear,
      };
    });
  };

  return (
    <div>
      <h2>Client Payments</h2>
      {Object.keys(updatedPayments).map((year) => (
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
              {Object.keys(updatedPayments[year]).map((month) => {
                const { amount, balance, isPaid } = updatedPayments[year][month] || {};
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
                    <td>{isPaid ? '✅' : '❌'}</td>
                    <td>
                      Balance: {balance !== undefined ? balance : clientData.fixedAmount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ClientPayments;
