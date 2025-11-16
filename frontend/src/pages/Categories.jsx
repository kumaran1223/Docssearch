import { useState, useEffect } from 'react';
import {
  FolderIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  getCategories,
  getCategoryBreakdown,
  getFiles,
  deleteFile,
  updateFile,
  createCategory,
  deleteCategory
} from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import FilePreviewModal from '../components/FilePreviewModal';

const CATEGORY_DESCRIPTIONS = {
  Campaigns: 'Marketing campaign briefs, plans, and strategies',
  Research: 'Market research, customer insights, and analysis',
  Strategy: 'Strategic planning documents and roadmaps',
  Budget: 'Budget allocations, financial planning, and forecasts',
  Creative: 'Creative briefs, design guidelines, and brand assets',
  Analytics: 'Performance reports, metrics, and data analysis',
  Legal: 'Legal documents, compliance, and regulations',
  Contracts: 'Partnership agreements and vendor contracts',
  'Meeting Notes': 'Team meetings, brainstorms, and discussions',
  Reports: 'Status reports, summaries, and documentation',
  Uncategorized: 'Documents pending classification',
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingCategory, setEditingCategory] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryFiles = async (category) => {
    setSelectedCategory(category);
    setFilesLoading(true);
    try {
      const data = await getFiles(1, category);
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(fileId);
      loadCategoryFiles(selectedCategory);
      loadCategories();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleMoveFile = async (fileId, newCategory) => {
    try {
      await updateFile(fileId, { category: newCategory });
      loadCategoryFiles(selectedCategory);
      loadCategories();
      setEditingFileId(null);
    } catch (error) {
      console.error('Error moving file:', error);
      alert('Failed to move file');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!confirm(`Delete category "${categoryName}"? All files will be moved to Uncategorized.`)) return;

    try {
      await deleteCategory(categoryName);
      if (selectedCategory === categoryName) {
        setSelectedCategory(null);
        setFiles([]);
      }
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      Campaigns: 'bg-blue-500',
      Research: 'bg-green-500',
      Strategy: 'bg-purple-500',
      Budget: 'bg-yellow-500',
      Creative: 'bg-pink-500',
      Analytics: 'bg-indigo-500',
      Legal: 'bg-red-500',
      Contracts: 'bg-orange-500',
      'Meeting Notes': 'bg-teal-500',
      Reports: 'bg-cyan-500',
      Uncategorized: 'bg-slate-500',
    };
    return colors[cat] || 'bg-slate-500';
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Categories</h1>
          <p className="mt-2 text-slate-600">
            Browse and manage document categories
          </p>
        </div>
        <button
          onClick={() => setShowNewCategoryModal(true)}
          className="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className={`card cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative ${
              selectedCategory === cat.category ? 'ring-2 ring-primary-500 shadow-lg' : ''
            }`}
          >
            <div onClick={() => loadCategoryFiles(cat.category)} className="flex items-center">
              <div className={`${getCategoryColor(cat.category)} p-4 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                <FolderIcon className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                  {cat.category}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {CATEGORY_DESCRIPTIONS[cat.category] || 'Custom category'}
                </p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <p className="text-2xl font-bold text-slate-900">{cat.count}</p>
                  <p className="text-xs text-slate-500">documents</p>
                </div>
              </div>
            </div>
            {/* Delete button for custom categories */}
            {!CATEGORY_DESCRIPTIONS[cat.category] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(cat.category);
                }}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Delete category"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Files List */}
      {selectedCategory && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {selectedCategory} Documents
            </h2>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setFiles([]);
              }}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Clear
            </button>
          </div>

          {filesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedFile(file._id)}
                    >
                      <h4 className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                        {file.title}
                      </h4>
                      {file.summary && (
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {file.summary.short}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(file.uploadDate), { addSuffix: true })}</span>
                        {file.tags && file.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{file.tags.slice(0, 3).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="ml-3 flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        file.processingStatus === 'complete' ? 'bg-green-100 text-green-700' :
                        file.processingStatus === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {file.processingStatus}
                      </span>

                      {/* Move to category dropdown */}
                      {editingFileId === file._id ? (
                        <div className="flex items-center space-x-1 animate-fadeIn">
                          <select
                            value={editingCategory}
                            onChange={(e) => setEditingCategory(e.target.value)}
                            className="text-xs border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">Select category...</option>
                            {categories.map((cat) => (
                              <option key={cat.category} value={cat.category}>
                                {cat.category}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveFile(file._id, editingCategory);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                            title="Confirm"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFileId(null);
                            }}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors duration-200"
                            title="Cancel"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFileId(file._id);
                              setEditingCategory(file.category);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Move to category"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file._id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Delete file"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="w-16 h-16 mx-auto text-slate-300" />
              <p className="mt-4 text-slate-600">No documents in this category</p>
            </div>
          )}
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          fileId={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform animate-slideUp">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
              placeholder="Enter category name..."
              className="input mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={handleCreateCategory}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
                disabled={!newCategoryName.trim()}
              >
                <CheckIcon className="w-5 h-5" />
                <span>Create</span>
              </button>
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                }}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <XMarkIcon className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

