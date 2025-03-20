'use client';
import { useState, useEffect } from 'react';
import SearchBar from '../../../components/searchbar';
import YearSwitcher from '../../../components/yearswitcher';
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
    const data = localStorage.getItem('clients');
    if (data) {
      const parsed = JSON.parse(data);
      setClients(parsed);
      setFilteredClients(parsed);
    }
  }, []);

  useEffect(() => {
    const filtered = clients.filter((client) =>
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
