'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className=" bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/home/clients" className="text-xl font-bold text-blue-600">
                  Dashboard
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/home/clients"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Clients
                </Link>
                <Link
                  href="#"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Payments
                </Link>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="hidden sm:flex sm:items-center">
              <div className="flex-shrink-0">
                <button
                  variant="primary"
                  onClick={handleLogout}
                  className="relative inline-flex bg-red-500 items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout 
                </button>
              </div>
            </div>
          </div>
          {/* Mobile menu */}
          <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard/clients"
                className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              >
                Clients
              </Link>
              <Link
                href="/dashboard/payments"
                className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              >
                Payments
              </Link>
              <button
                onClick={handleLogout}
                className=" rounded-md text-left pl-3 pr-4 py-2 border-l-4 bg-red-500 text-white text-base font-medium border-transparent p-2 w-fit hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
