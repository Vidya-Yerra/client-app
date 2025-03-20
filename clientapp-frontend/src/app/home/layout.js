// /app/home/layout.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/sidebar';
import Navbar from '../../components/navbar';

export default function HomeLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
      return;
    }
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 overflow-y-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
