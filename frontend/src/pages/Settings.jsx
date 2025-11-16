import { useState, useEffect } from 'react';
import { Cog6ToothIcon, ServerIcon, KeyIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getStats } from '../services/api';

export default function Settings() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          System configuration and information
        </p>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="flex items-center mb-6">
          <ServerIcon className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-slate-900">System Information</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Total Documents</span>
              <span className="font-semibold text-slate-900">{stats?.totalFiles || 0}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Total Searches</span>
              <span className="font-semibold text-slate-900">{stats?.totalSearches || 0}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-200">
              <span className="text-slate-600">Active Categories</span>
              <span className="font-semibold text-slate-900">{stats?.categoriesCount || 0}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-slate-600">Storage Used</span>
              <span className="font-semibold text-slate-900">{formatBytes(stats?.storageUsed || 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* API Configuration */}
      <div className="card">
        <div className="flex items-center mb-6">
          <KeyIcon className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-slate-900">API Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Backend API URL
            </label>
            <input
              type="text"
              value={import.meta.env.VITE_API_URL || '/api'}
              disabled
              className="input bg-slate-50 text-slate-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              The backend API endpoint for this application
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Environment
            </label>
            <input
              type="text"
              value={import.meta.env.MODE || 'development'}
              disabled
              className="input bg-slate-50 text-slate-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Current application environment
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center mb-6">
          <InformationCircleIcon className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-slate-900">About DocsSearch</h2>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <p>
            <strong className="text-slate-900">Version:</strong> 1.0.0
          </p>
          <p>
            <strong className="text-slate-900">Description:</strong> AI-powered semantic search
            application for internal marketing knowledge management with Google Gemini AI integration.
          </p>
          <p>
            <strong className="text-slate-900">Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Hybrid semantic + keyword search</li>
            <li>Multi-format document support (PDF, DOCX, PPTX, TXT, Images)</li>
            <li>AI-powered summarization and classification</li>
            <li>Automatic tagging and categorization</li>
            <li>Similar document recommendations</li>
          </ul>
          <p>
            <strong className="text-slate-900">Technology Stack:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Frontend: React 18 + Vite + Tailwind CSS</li>
            <li>Backend: Node.js + Express + MongoDB</li>
            <li>AI: Google Gemini API (text-embedding-004, gemini-pro)</li>
          </ul>
        </div>
      </div>

      {/* Support */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-4">
          For support, documentation, or to report issues, please refer to the README.md file
          in the project repository.
        </p>
        <div className="flex space-x-4">
          <a
            href="https://github.com/yourusername/docssearch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Documentation →
          </a>
          <a
            href="https://ai.google.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Gemini API Docs →
          </a>
        </div>
      </div>
    </div>
  );
}

