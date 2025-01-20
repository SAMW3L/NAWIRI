import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/stock', icon: ClipboardList, label: 'Stock' },
  { path: '/expenses', icon: DollarSign, label: 'Expenses' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-800">NAWIRI BMS</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 w-full px-4 py-2.5 rounded-lg hover:bg-gray-50">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 bg-white shadow-sm flex items-center px-6 sticky top-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.label ||
              'Dashboard'}
          </h2>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}