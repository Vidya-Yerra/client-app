'use client';

import { useState, useEffect } from 'react';
import Papa from "papaparse";


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
  const [newClient, setNewClient] = useState({ name: '', phone: '', fixedAmount: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

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

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.phone || !newClient.fixedAmount) {
      alert('Please fill all fields');
      return;
    }
  
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch('https://client-app-6.onrender.com/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient),
      });
  
      if (res.ok) {
        const savedClient = await res.json();
  
        const newClientWithPayments = {
          ...savedClient,
          editablePayments: Array(12).fill(0),
        };
  
        setClientData([...clientData, newClientWithPayments]);
        setNewClient({ name: '', phone: '', fixedAmount: '' });
        setShowAddForm(false);
      } else {
        console.error('Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };
  
  const handleEditToggle = (index) => {
    setEditIndex(index === editIndex ? null : index);
  };

  const handleUpdateClient = async (index) => {
    const client = clientData[index];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://client-app-6.onrender.com/clients/${client._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: client.name,
          phone: client.phone,
          fixedAmount: client.fixedAmount,
        }),
      });

      if (res.ok) {
        setEditIndex(null);
      } else {
        console.error('Failed to update client');
      }
    } catch (err) {
      console.error('Error updating client:', err);
    }
  };

  const handleDeleteClient = async (index) => {
    const client = clientData[index];
    if (!window.confirm(`Are you sure you want to delete ${client.name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://client-app-6.onrender.com/clients/${client._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated = [...clientData];
        updated.splice(index, 1);
        setClientData(updated);
      } else {
        console.error('Failed to delete client');
      }
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };
  
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const currenttoken = localStorage.getItem("token");
    if (!currenttoken) {
      alert("Please log in to upload.");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedClients = results.data
        .filter(row => row.name && row.phone && row.fixedamount)
        .map((row) => ({
          name: row.name,
          phone: row.phone,
          fixedAmount: row.fixedamount,
        }));
        console.log("parsedclients:",parsedClients);
        try {
          const response = await fetch("https://client-app-6.onrender.com/clients/upload-csv", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${currenttoken}`
            },
            body: JSON.stringify({
              clients: parsedClients,
               
            }),
          });
  
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
  
          alert("CSV uploaded and clients saved!");

        } catch (error) {
          console.error("Upload failed", error);
        }
      },
    });
  };
  

  return (
    <div className="overflow-auto border rounded shadow bg-white p-4">
      {/* Add Client Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
        >
          {showAddForm ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      {/* Add Client Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="flex gap-4 mb-2">
            <input
              type="text"
              placeholder="Client Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="border p-2 rounded w-1/3"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="border p-2 rounded w-1/3"
            />
            <input
              type="number"
              placeholder="Fixed Amount"
              value={newClient.fixedAmount}
              onChange={(e) => setNewClient({ ...newClient, fixedAmount: e.target.value })}
              className="border p-2 rounded w-1/3"
            />
          </div>
          <button
            onClick={handleAddClient}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Done
          </button>
        </div>
      )}

      {/* Upload CSV File Button */}
      <div className="mb-4">
        <button
          onClick={() => document.getElementById('csvUpload').click()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
        >
          Upload CSV
        </button>
        <input
          type="file"
          id="csvUpload"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />
      </div>


      {/* Client Table */}
      <table className="w-full border-collapse min-w-[1000px]">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Fixed Amount</th>
            {months.map((month) => (
              <th key={month} className="p-2 border text-center">{month}</th>
            ))}
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clientData.map((client, index) => {
            const status = getClientStatus(client.editablePayments, client.fixedAmount);
            const isEditing = index === editIndex;

            return (
              <tr key={index} className="text-sm hover:bg-gray-50">
                <td className="p-2 border">
                  {isEditing ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={client.name}
                      onChange={(e) => {
                        const updated = [...clientData];
                        updated[index].name = e.target.value;
                        setClientData(updated);
                      }}
                    />
                  ) : (
                    client.name
                  )}
                </td>
                <td className="p-2 border">
                  {isEditing ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={client.phone}
                      onChange={(e) => {
                        const updated = [...clientData];
                        updated[index].phone = e.target.value;
                        setClientData(updated);
                      }}
                    />
                  ) : (
                    client.phone
                  )}
                </td>
                <td className="p-2 border">
                  {isEditing ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={client.fixedAmount}
                      onChange={(e) => {
                        const updated = [...clientData];
                        updated[index].fixedAmount = e.target.value;
                        setClientData(updated);
                      }}
                    />
                  ) : (
                    client.fixedAmount
                  )}
                </td>

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

                <td className="p-2 border text-center whitespace-nowrap">
                  {isEditing ? (
                    <button
                      onClick={() => handleUpdateClient(index)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditToggle(index)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClient(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Save Button for All Payments */}
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