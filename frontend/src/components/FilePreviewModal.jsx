import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getFilePreview, getSimilarDocuments, downloadFile } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function FilePreviewModal({ fileId, onClose }) {
  const [file, setFile] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFileData();
  }, [fileId]);

  const loadFileData = async () => {
    try {
      const [fileData, similarData] = await Promise.all([
        getFilePreview(fileId),
        getSimilarDocuments(fileId, 5),
      ]);
      setFile(fileData);
      setSimilar(similarData.similar || []);
    } catch (error) {
      console.error('Error loading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    downloadFile(fileId);
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
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  </div>
                ) : file ? (
                  <>
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-200">
                      <div className="flex-1">
                        <Dialog.Title className="text-2xl font-bold text-slate-900">
                          {file.title}
                        </Dialog.Title>
                        <div className="mt-2 flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                            {file.category}
                          </span>
                          <span className="text-sm text-slate-500">
                            {formatDistanceToNow(new Date(file.uploadDate), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleDownload}
                          className="p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={onClose}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                      {/* Summary */}
                      {file.summary && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">AI Summary</h3>
                          <p className="text-slate-900 mb-3">{file.summary.short}</p>
                          {file.summary.bullets && file.summary.bullets.length > 0 && (
                            <ul className="space-y-1">
                              {file.summary.bullets.map((bullet, index) => (
                                <li key={index} className="text-sm text-slate-700 flex items-start">
                                  <span className="text-primary-600 mr-2">•</span>
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {file.tags && file.tags.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {file.tags.map((tag) => (
                              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Text Preview */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Document Preview</h3>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {file.text}
                            {file.text && file.text.length >= 2000 && (
                              <span className="text-slate-500">... (truncated)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Similar Documents */}
                      {similar.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-3">Similar Documents</h3>
                          <div className="space-y-3">
                            {similar.map((doc) => (
                              <div
                                key={doc.id}
                                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors cursor-pointer"
                                onClick={() => {
                                  onClose();
                                  // Could open new modal with this document
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-slate-900">{doc.title}</h4>
                                    {doc.summary && (
                                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                        {doc.summary.short}
                                      </p>
                                    )}
                                    <div className="mt-2 flex items-center space-x-2">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                                        {doc.category}
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        {Math.round(doc.score * 100)}% similar
                                      </span>
                                    </div>
                                  </div>
                                  <DocumentTextIcon className="w-5 h-5 text-slate-400 ml-3" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-slate-600">File not found</p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

