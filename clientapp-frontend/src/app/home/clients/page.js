'use client';

import { useState, useEffect } from 'react';
import SearchBar from '../../../components/searchbar';
import YearSwitcher from '../../../components/yearswitch';
import Pagination from '../../../components/pagination';
import ClientTable from '../../../components/clienttable';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthToIndex = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11
  };
  

  // Fetch clients and transform payments
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("No token found, skipping fetch.");
        return;
      }
      
      console.log("Fetching clients...");
      const response = await fetch('http://localhost:5000/clients', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const result = await response.json();
      console.log("Fetched clients response:", result);

      if (response.ok) {
        const transformedClients = result.map(client => {
          const transformedPayments = {};
          if (client.payments && typeof client.payments === 'object') {
            Object.entries(client.payments).forEach(([year, months]) => {
              transformedPayments[year] = Array(12).fill(0);
          
              Object.entries(months).forEach(([monthName, paymentData]) => {
                const monthIndex = monthToIndex[monthName];
                if (monthIndex !== undefined) {
                  transformedPayments[year][monthIndex] = paymentData.amount || 0;
                } else {
                  console.warn(`Invalid month name: ${monthName}`);
                }
              });
            });
          }

          console.log("Transformed payments (JSON):", JSON.stringify(transformedPayments, null, 2));

          return { ...client, payments: transformedPayments };
        });

        console.log("About to update state with transformed clients...");
        setClients(transformedClients);
        setFilteredClients(transformedClients);
        console.log("Updated state with transformed clients:", transformedClients);
      } else {
        console.error("Error fetching clients:", result.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  // Fetch clients on initial render
  useEffect(() => {
    fetchClients();
  }, []);

  // Filter clients based on search
  useEffect(() => {
    console.log("Filtering clients based on search:", searchTerm);
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const paginatedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);
  console.log("Paginated clients: ", paginatedClients);
  // Save updated payments
const handleSavePage = async (updatedClients) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No token found. Please log in again.");
      console.warn("No token found, skipping save.");
      return;
    }
  
    try {
      for (const client of updatedClients) {
        // Send all 12 months, even if the amount is 0
        const formattedPayments = months.map((month, idx) => ({
          year: client.year,
          month,
          enteredAmount: Number(client.updatedPayments[idx]) || 0,
        }));
  
        console.log("Submitting payments for", client.clientId);
        console.log("Payload:", formattedPayments);
  
        const payload = { payments: formattedPayments };
  
        const res = await fetch(`http://localhost:5000/payments/${client.clientId}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
  
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.message || `Failed to save payments for ${client.clientId}`);
        }
  
        console.log(`Successfully saved payments for ${client.clientId}`, responseData);
      }
  
      alert('Payments saved successfully');
      console.log("Refetching clients after saving payments...");
      await fetchClients(); // Refetch clients to update state with saved data
      console.log("Clients refreshed after saving payments");
  
    } catch (error) {
      console.error('Save error:', error);
      alert(`Error saving payments: ${error.message}`);
    }
  };
  

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <YearSwitcher year={year} setYear={setYear} />
      </div>

      <ClientTable
        clients={paginatedClients}
        year={year}
        onSavePage={handleSavePage}
      />

      <Pagination
        currentPage={page}
        totalItems={filteredClients.length}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
