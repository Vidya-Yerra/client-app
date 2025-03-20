// Sidebar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <h1 className="text-2xl font-bold p-4 border-b border-gray-700">Dashboard</h1>
      <nav className="flex-1">
        <ul>
          <li>
            <Link
              href="/home/clients"
              className={`block p-4 hover:bg-gray-700 ${pathname === '/home/clients' ? 'bg-gray-700' : ''}`}
            >
              Clients
            </Link>
          </li>
          <li>
            <Link
              href="/home/settings"
              className={`block p-4 hover:bg-gray-700 ${pathname === '/home/settings' ? 'bg-gray-700' : ''}`}
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
