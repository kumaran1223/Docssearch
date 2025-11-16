import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ServerIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getStats, getCategoryBreakdown, getRecentUploads, getRecentSearches } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, categoriesData, uploadsData, searchesData] = await Promise.all([
        getStats().catch(() => ({ totalFiles: 0, totalSearches: 0, totalCategories: 0, totalStorage: 0 })),
        getCategoryBreakdown().catch(() => []),
        getRecentUploads(5).catch(() => []),
        getRecentSearches(5).catch(() => []),
      ]);

      setStats(statsData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setRecentUploads(Array.isArray(uploadsData) ? uploadsData : []);
      setRecentSearches(Array.isArray(searchesData) ? searchesData : []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default values on error
      setStats({ totalFiles: 0, totalSearches: 0, totalCategories: 0, totalStorage: 0 });
      setCategories([]);
      setRecentUploads([]);
      setRecentSearches([]);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-600 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Documents',
      value: stats?.totalFiles || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      link: '/categories',
    },
    {
      name: 'Total Searches',
      value: stats?.totalSearches || 0,
      icon: MagnifyingGlassIcon,
      color: 'bg-green-500',
      link: '/search',
    },
    {
      name: 'Categories',
      value: stats?.categoriesCount || 0,
      icon: FolderIcon,
      color: 'bg-purple-500',
      link: '/categories',
    },
    {
      name: 'Storage Used',
      value: formatBytes(stats?.storageUsed || 0),
      icon: ServerIcon,
      color: 'bg-orange-500',
      link: '/settings',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SparklesIcon className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Overview of your marketing knowledge base</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group animate-slideUp"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-2 mb-4">
            <ClockIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Uploads</h2>
          </div>
          <div className="space-y-3">
            {recentUploads.length > 0 ? (
              recentUploads.map((file, index) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded transition-colors duration-200 animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.title}</p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(file.uploadDate), { addSuffix: true })}</span>
                    </p>
                  </div>
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full shadow-sm ${
                    file.processingStatus === 'complete' ? 'bg-green-100 text-green-700' :
                    file.processingStatus === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {file.processingStatus}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No uploads yet</p>
            )}
          </div>
          <Link
            to="/upload"
            className="mt-4 block text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200 hover:underline"
          >
            Upload Document →
          </Link>
        </div>

        {/* Recent Searches */}
        <div className="card hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center space-x-2 mb-4">
            <MagnifyingGlassIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Searches</h2>
          </div>
          <div className="space-y-3">
            {recentSearches.length > 0 ? (
              recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded transition-colors duration-200 animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{search.query}</p>
                    <p className="text-xs text-slate-500">
                      {search.resultsCount} results • {formatDistanceToNow(new Date(search.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No searches yet</p>
            )}
          </div>
          <Link
            to="/search"
            className="mt-4 block text-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200 hover:underline"
          >
            Search Documents →
          </Link>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center space-x-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-slate-900">Category Breakdown</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <div
              key={cat.category}
              className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 animate-scaleIn"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <p className="text-sm font-medium text-slate-600">{cat.category}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{cat.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

