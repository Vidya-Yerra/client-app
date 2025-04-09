'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import useRouter
import Link from 'next/link';

export default function Signup() {
  const router = useRouter(); // ✅ Initialize router

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        alert('Signup successful!');
        router.push('/home/clients'); // ✅ Redirect to login after success
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f36] px-4">
      <div className="w-full max-w-md bg-[#2d3748] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center text-white">Create an Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[#a0aec0]">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#475569] rounded-md bg-[#1f2937] text-white focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Enter your name"
            />
          </div>
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
            <label className="block text-sm font-medium mb-1 text-[#a0aec0]">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[#475569] rounded-md bg-[#1f2937] text-white focus:outline-none focus:ring focus:ring-blue-400"
              placeholder="Enter your phone number"
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
              placeholder="Create a password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-[#374151] text-white py-2 px-4 rounded-md transition-all duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-[#a0aec0]">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}