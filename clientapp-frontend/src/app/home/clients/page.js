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

  // Fetch clients on initial render
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await fetch('http://localhost:5000/clients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok) {
          setClients(result);
          setFilteredClients(result);
        } else {
          console.error(result.message || 'Failed to fetch clients');
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search
  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const paginatedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  // Updated save function
  const handleSavePage = async (updatedClients) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    try {
      for (const client of updatedClients) {
        const formattedPayments = client.updatedPayments.map((amt, idx) => ({
          year: client.year,
          month: months[idx],
          amount: amt
        }));

        const payload = { payments:formattedPayments };

        console.log('Saving payments for:', client.clientId);
        console.log('Payload being sent:', JSON.stringify(payload, null, 2));

        const res = await fetch(`http://localhost:5000/clients/${client.clientId}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to save payments for ${client.clientId}`);
        }
      }

      alert('Payments saved successfully');
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
