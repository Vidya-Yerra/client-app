'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Create the context
const AppContext = createContext();

// Custom hook for easier access
export const useAppContext = () => useContext(AppContext);

// Load clients from localStorage
const loadClientsFromStorage = () => {
  try {
    const stored = localStorage.getItem('clients');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse clients from storage:', error);
    return [];
  }
};

// Provider component
export const AppProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load clients from localStorage on first load
  useEffect(() => {
    const savedClients = loadClientsFromStorage();
    setClients(savedClients);
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  // Add a new client
  const addClient = (client) => {
    setClients((prev) => [...prev, client]);
  };

  // Update an existing client by index
  const updateClient = (index, updatedClient) => {
    const updated = [...clients];
    updated[index] = updatedClient;
    setClients(updated);
  };

  // Delete a client by index
  const deleteClient = (index) => {
    const updated = [...clients];
    updated.splice(index, 1);
    setClients(updated);
  };

  // Upload multiple clients from CSV (array of objects)
  const uploadClientsFromCSV = (csvClients) => {
    setClients((prev) => [...prev, ...csvClients]);
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        setClients,
        year,
        setYear,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        addClient,
        updateClient,
        deleteClient,
        uploadClientsFromCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
