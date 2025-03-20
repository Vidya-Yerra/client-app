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
        console.log('Fetched clients:', result);  // Log the response to see the data
  
        if (response.ok) {
          setClients(result);  // Set clients from the response
          setFilteredClients(result);  // Update the filtered clients
        } else {
          console.error(result.message || 'Failed to fetch clients');
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
  
    fetchClients();
  }, []);
  
  

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const paginatedClients = filteredClients.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <YearSwitcher year={year} setYear={setYear} />
      </div>
      <ClientTable clients={paginatedClients} year={year} />
      <Pagination
        currentPage={page}
        totalItems={filteredClients.length}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
