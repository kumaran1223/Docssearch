import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  ClockIcon,
  TagIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { searchDocuments, getCategories } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import FilePreviewModal from '../components/FilePreviewModal';

export default function Search() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const categoryNames = data.map(cat => cat.category);
        setCategories(['All', ...categoryNames]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const data = await searchDocuments(query, category);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Campaigns: 'bg-blue-100 text-blue-700',
      Research: 'bg-green-100 text-green-700',
      Strategy: 'bg-purple-100 text-purple-700',
      Budget: 'bg-yellow-100 text-yellow-700',
      Creative: 'bg-pink-100 text-pink-700',
      Analytics: 'bg-indigo-100 text-indigo-700',
      Legal: 'bg-red-100 text-red-700',
      Contracts: 'bg-orange-100 text-orange-700',
      'Meeting Notes': 'bg-teal-100 text-teal-700',
      Reports: 'bg-cyan-100 text-cyan-700',
    };
    return colors[cat] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <DocumentMagnifyingGlassIcon className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Search Documents</h1>
          <p className="mt-1 text-slate-600 flex items-center space-x-2">
            <SparklesIcon className="w-4 h-4" />
            <span>AI-powered semantic search across your marketing knowledge base</span>
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for campaigns, strategies, reports..."
                className="input pl-12"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
            <button type="submit" className="btn-primary px-8" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      category === cat
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 animate-pulse flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span>Searching with AI...</span>
          </p>
        </div>
      )}

      {!loading && searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              Found <span className="font-semibold">{results.length}</span> results
              {category !== 'All' && ` in ${category}`}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedFile(result.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                        {result.title}
                      </h3>
                      <div
                        className="mt-2 text-sm text-slate-600 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.snippet }}
                      />
                      <div className="mt-3 flex items-center flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getCategoryColor(result.category)}`}>
                          {result.category}
                        </span>
                        {result.tags && result.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="flex items-center space-x-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            <TagIcon className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                        <span className="flex items-center space-x-1 text-xs text-slate-400">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(result.uploadDate), { addSuffix: true })}</span>
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <div className="text-sm font-medium text-slate-900">
                        {Math.round(result.score * 100)}% match
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Semantic: {Math.round(result.semanticScore * 100)}%
                      </div>
                      <div className="text-xs text-slate-500">
                        Keyword: {Math.round(result.keywordScore * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-slate-300" />
              <p className="mt-4 text-lg font-medium text-slate-900">No results found</p>
              <p className="mt-2 text-sm text-slate-500">
                Try different keywords or adjust your filters
              </p>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="card text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-900">Start searching</p>
          <p className="mt-2 text-sm text-slate-500">
            Enter keywords to find relevant marketing documents
          </p>
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          fileId={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

