import React, { useState, useEffect } from 'react';

const PaymentTracker = ({ client, payments }) => {
  const [enteredAmounts, setEnteredAmounts] = useState({});
  const [totalPaid, setTotalPaid] = useState(0);

  // Set initial entered amounts based on existing payments
  useEffect(() => {
    const initialEnteredAmounts = {};
    let paidTotal = 0;

    payments.forEach(payment => {
      initialEnteredAmounts[payment.month] = payment.enteredAmount;
      paidTotal += payment.enteredAmount;
    });

    setEnteredAmounts(initialEnteredAmounts);
    setTotalPaid(paidTotal);
  }, [payments]);

  // Function to handle amount entry
  const handleAmountChange = (month, amount) => {
    if (isNaN(amount) || amount < 0) return; // Ensure the amount is a valid number and non-negative
    const newEnteredAmounts = { ...enteredAmounts, [month]: amount };
    setEnteredAmounts(newEnteredAmounts);

    // Recalculate total paid
    const newTotalPaid = Object.values(newEnteredAmounts).reduce((sum, amt) => sum + amt, 0);
    setTotalPaid(newTotalPaid);
  };

  // Logic to determine if the client has paid fully for the month and previous months
  const isPaid = (month) => {
    const fixedAmount = 100;
    const enteredAmount = enteredAmounts[month] || 0; // Amount entered for the month

    // If no amount has been entered yet, return an empty string for the status (no tick/cross)
    if (enteredAmount === 0 || enteredAmount === '') return '';

    // Calculate cumulative expected amount
    const monthsList = [
      "January", "February", "March", "April", "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];
    const expectedAmount = (monthsList.indexOf(month) + 1) * fixedAmount; // Cumulative expected amount

    // Calculate the cumulative total paid up to this month
    const cumulativePaid = Object.keys(enteredAmounts)
      .slice(0, monthsList.indexOf(month) + 1) // Get the months up to the current one
      .reduce((sum, m) => sum + (enteredAmounts[m] || 0), 0); // Sum up the payments made until the current month

    // If cumulative paid is greater than or equal to expected, update this and all previous months to ✅
    if (cumulativePaid >= expectedAmount) {
      // Update all previous months to ✅
      Object.keys(enteredAmounts).forEach(m => {
        if (monthsList.indexOf(m) <= monthsList.indexOf(month)) {
          enteredAmounts[m] = 100; // Set as fully paid (₹100 for each month)
        }
      });
      return '✅';
    } else {
      return '❌';
    }
  };

  return (
    <div>
      <h2>🔽 Expanded View: Cumulative Payment Tracker for {client.name}</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Fixed Amount</th>
            <th>Total Expected</th>
            <th>Total Paid</th>
            <th>Paid?</th>
            <th>Entered Amount</th>
          </tr>
        </thead>
        <tbody>
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => {
            const fixedAmount = 100; // Fixed amount per month
            const cumulativeExpected = (index + 1) * fixedAmount; // Cumulative expected amount

            // Calculate total paid for the month up until now (cumulative total)
            const totalForMonthPaid = Object.keys(enteredAmounts)
              .slice(0, index + 1) // Include months up to current month
              .reduce((sum, m) => sum + (enteredAmounts[m] || 0), 0); // Sum payments made until the current month

            return (
              <tr key={month}>
                <td>{month}</td>
                <td>₹{fixedAmount}</td>
                <td>₹{cumulativeExpected}</td>
                <td>₹{totalForMonthPaid}</td>
                <td>{isPaid(month)}</td>
                <td>
                  <input
                    type="number"
                    value={enteredAmounts[month] !== undefined ? enteredAmounts[month] : ''} // Allow empty value for non-entered months
                    onChange={(e) => handleAmountChange(month, e.target.value !== '' ? parseFloat(e.target.value) : 0)} // Handle empty string as 0
                    min="0" // Prevent negative amounts
                    step="0.01" // Allow decimal input (e.g., ₹99.99)
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <h3>Total Paid: ₹{totalPaid}</h3>
        <h3>Total Expected: ₹{100 * 12}</h3> {/* ₹100 * 12 months */}
      </div>
    </div>
  );
};

export default PaymentTracker;
