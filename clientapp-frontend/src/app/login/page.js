'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANT: allows cookies to be saved
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('token', data.token);
        router.push('/home/clients');
      } else {
        alert(data.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      alert('Something went wrong!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f36] px-4">
      <div className="w-full max-w-md bg-[#2d3748] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#a0aec0]">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#475569] rounded-md bg-[#1f2937] text-white focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[#a0aec0]">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#475569] rounded-md bg-[#1f2937] text-white focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-[#374151] text-white py-2 px-4 rounded-md transition-all duration-200"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-[#a0aec0]">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-400 hover:text-blue-300">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}