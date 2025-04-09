// Sidebar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 bg-gradient-to-b from-[#1a1f36] to-[#16252a] text-white flex flex-col">
      <h1 className="text-xl md:text-2xl font-bold p-4 border-b border-[#2d3748] tracking-tight">Dashboard</h1>
      <nav className="flex-1">
        <ul className="space-y-1">
          <li>
            <Link
              href="/home/clients"
              className={`block p-4 rounded-lg transition-all duration-200 ${
                pathname === '/home/clients'
                  ? 'bg-[#2d3748] text-white'
                  : 'hover:bg-[#2d3748]/50 hover:text-[#a0aec0]'
              }`}
            >
              <span className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Clients</span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/home/settings"
              className={`block p-4 rounded-lg transition-all duration-200 ${
                pathname === '/home/settings'
                  ? 'bg-[#2d3748] text-white'
                  : 'hover:bg-[#2d3748]/50 hover:text-[#a0aec0]'
              }`}
            >
              <span className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
