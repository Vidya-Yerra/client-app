'use client';

import { useState, useEffect } from 'react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getClientStatus(payments, fixedAmount) {
  const updatedStatus = [];
  const monthlyBalances = [];
  let carryForward = 0;

  for (let i = 0; i < 12; i++) {
    const paid = payments?.[i] || 0;
    const totalPaid = paid + carryForward;
    const balance = Math.max(fixedAmount - totalPaid, 0);
    carryForward = totalPaid - fixedAmount;

    monthlyBalances.push(balance);
    updatedStatus.push({ status: balance > 0 ? '❌' : '✅', balance });
  }

  for (let i = 0; i < 12; i++) {
    const totalPaidTillNow = payments?.slice(0, i + 1).reduce((sum, val) => sum + val, 0);
    const expectedTillNow = fixedAmount * (i + 1);

    if (totalPaidTillNow >= expectedTillNow) {
      for (let j = 0; j <= i; j++) {
        updatedStatus[j].status = '✅';
      }
    }
  }

  return updatedStatus;
}

export default function ClientTable({ clients, year, onSavePage }) {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    const initialData = clients.map(client => ({
      ...client,
      editablePayments: Array.isArray(client.payments?.[year])
        ? [...client.payments[year]]
        : Array(12).fill(0)
    }));
    setClientData(initialData);
  }, [clients, year]);

  const handlePaymentChange = (clientIndex, monthIndex, value) => {
    const updated = [...clientData];
    const amount = parseFloat(value) || 0;
    updated[clientIndex].editablePayments[monthIndex] = amount;
    setClientData(updated);
  };

  const handleSaveClick = () => {
    const updatedClients = clientData.map(client => ({
      clientId: client._id,
      updatedPayments: client.editablePayments,
      year: year
    }));

    if (onSavePage) {
      onSavePage(updatedClients);
    }
  };

  return (
    <div className="overflow-auto border rounded shadow bg-white p-4">
      <table className="w-full border-collapse min-w-[1000px]">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Fixed Amount</th>
            {months.map((month) => (
              <th key={month} className="p-2 border text-center">{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientData.map((client, index) => {
            const status = getClientStatus(client.editablePayments, client.fixedAmount);

            return (
              <tr key={index} className="text-sm hover:bg-gray-50">
                <td className="p-2 border">{client.name}</td>
                <td className="p-2 border">{client.phone}</td>
                <td className="p-2 border">${client.fixedAmount}</td>
                {status.map((month, i) => (
                  <td key={i} className="p-2 border text-center">
                    <input
                      type="number"
                      className="w-16 p-1 border rounded text-center mb-1"
                      value={client.editablePayments[i]}
                      onChange={(e) => handlePaymentChange(index, i, e.target.value)}
                    />
                    <div className="mt-1">
                      {month.status}
                      <div className="text-xs text-gray-600">Bal: {month.balance}</div>
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Save Button for the Page */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSaveClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Save 
        </button>
      </div>
    </div>
  );
}
