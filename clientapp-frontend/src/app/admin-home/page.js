'use client'
import React, { useEffect, useState } from 'react'
import PaymentTracker from '../paymenttracker'; // Import the PaymentTracker component

export default function AdminHome() {
  const [users, setUsers] = useState([])
  const [expandedUser, setExpandedUser] = useState(null)
  const [expandedClient, setExpandedClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  // List of months for the "Month" column
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found. Please login again.')
      }

      const res = await fetch('http://localhost:5000/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to fetch users')
      }

      const data = await res.json()
      console.log('Fetched users:', data)
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format: users should be an array')
      }

      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  const toggleClientExpansion = (clientId) => {
    setExpandedClient(expandedClient === clientId ? null : clientId)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="p-2">User Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Clients</th>
                  <th className="p-2">Expand</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <tr className="bg-gray-100 text-center">
                      <td className="p-2">{user.name}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.phone}</td>
                      <td className="p-2">{Array.isArray(user.clients) ? user.clients.length : 0}</td>
                      <td className="p-2">
                        <button
                          onClick={() => toggleUserExpansion(user._id)}
                          className="expand-button"
                        >
                          {expandedUser === user._id ? '🔼 Collapse' : '🔽 View Clients'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Client List */}
                    {expandedUser === user._id && (
                      <tr>
                        <td colSpan="5" className="p-4 bg-white border">
                          <h3 className="font-semibold">🔽 Clients for {user.name}</h3>
                          <table className="w-full border mt-2">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="p-2">Client Name</th>
                                <th className="p-2">Phone Number</th>
                                <th className="p-2">Fixed Amount</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">🔽 Expand Payments</th>
                              </tr>
                            </thead>
                            <tbody>
                              {user.clients?.map((client) => (
                                <React.Fragment key={client._id}>
                                  <tr className="text-center">
                                    <td className="p-2">{client.name}</td>
                                    <td className="p-2">{client.phone}</td>
                                    <td className="p-2">₹{client.fixedAmount}</td>
                                    <td className={`p-2 ${client.isPaid ? 'text-green-500' : 'text-red-500'}`}>
                                      {client.isPaid ? '✅' : '❌'}
                                    </td>
                                    <td className="p-2">
                                      <button
                                        onClick={() => toggleClientExpansion(client._id)}
                                        className="expand-button"
                                      >
                                        {expandedClient === client._id ? '🔼 Collapse' : '🔽 View Payments'}
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expanded Payment History */}
                                  {expandedClient === client._id && (
                                    <tr>
                                      <td colSpan="5" className="p-4 bg-gray-50">
                                        <h4 className="font-semibold">Payment Tracker - {client.name}</h4>
                                        <PaymentTracker client={client} payments={client.payments || []} />
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map((_, index) => (
                <button key={index} onClick={() => paginate(index + 1)} className="pagination-button">
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
