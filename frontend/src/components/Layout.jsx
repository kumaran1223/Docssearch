import { Outlet, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  FolderIcon,
  Cog6ToothIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Search', to: '/search', icon: MagnifyingGlassIcon },
  { name: 'Upload', to: '/upload', icon: CloudArrowUpIcon },
  { name: 'Categories', to: '/categories', icon: FolderIcon },
  { name: 'Settings', to: '/settings', icon: Cog6ToothIcon },
];

export default function Layout() {
  const [systemOnline, setSystemOnline] = useState(true);

  useEffect(() => {
    // Check system health
    const checkHealth = async () => {
      try {
        await api.get('/health');
        setSystemOnline(true);
      } catch (error) {
        setSystemOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-800 to-indigo-900 shadow-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-slate-700">
          <h1 className="text-2xl font-display font-bold text-white flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-primary-400" />
            <span><span className="text-primary-400">Docs</span>Search</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            AI-Powered Knowledge Discovery
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            v1.0.0
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-md">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Marketing Knowledge Base
                </h2>
                <p className="text-xs text-slate-500">
                  Search and discover marketing documents with AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-300 ${
                systemOnline
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {systemOnline ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">System Online</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-700">System Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

