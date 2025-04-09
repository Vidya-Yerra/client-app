// Navbar.js
'use client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm transition-all duration-200 hover:shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Client Payment Tracker</h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Logout
      </button>
    </div>
  );
}
