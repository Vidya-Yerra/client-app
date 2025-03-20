'use client';

import { useMemo } from 'react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getClientStatus(payments, fixedAmount) {
  const updatedStatus = [];
  let carryForward = 0;

  for (let i = 0; i < 12; i++) {
    const paid = payments?.[i] || 0;
    const totalPaid = paid + carryForward;
    const balance = fixedAmount - totalPaid;

    if (balance <= 0) {
      carryForward = totalPaid - fixedAmount;
      updatedStatus.push({ status: '✅', balance: 0 });
    } else {
      carryForward = 0;
      updatedStatus.push({ status: '❌', balance: balance });
    }
  }

  return updatedStatus;
}

export default function ClientTable({ clients, year }) {
  return (
    <div className="overflow-auto border rounded shadow bg-white">
      <table className="w-full border-collapse min-w-[900px]">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Fixed Amount</th>
            {months.map((month) => (
              <th key={month} className="p-2 border">{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => {
            const status = getClientStatus(client.payments?.[year] || [], client.fixedAmount);

            return (
              <tr key={index} className="text-sm hover:bg-gray-50">
                <td className="p-2 border">{client.name}</td>
                <td className="p-2 border">{client.phone}</td>
                <td className="p-2 border">${client.fixedAmount}</td>
                {status.map((month, i) => (
                  <td key={i} className="p-2 border text-center">
                    {month.status}
                    <br />
                    <span className="text-xs text-gray-600">Balance: {month.balance}</span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
