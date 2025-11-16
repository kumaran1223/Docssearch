import { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { uploadFile, getUploadStatus } from '../services/api';

const PROCESSING_STAGES = [
  { key: 'pending', label: 'Uploading', description: 'Transferring file to server' },
  { key: 'extracting', label: 'Extracting', description: 'Extracting text from document' },
  { key: 'embedding', label: 'Embedding', description: 'Generating AI embeddings' },
  { key: 'tagging', label: 'Analyzing', description: 'Classifying and tagging' },
  { key: 'complete', label: 'Complete', description: 'Ready to search' },
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setProcessingStatus(null);
      setUploadedFileId(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
      setProcessingStatus(null);
      setUploadedFileId(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload file
      const result = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedFileId(result.file.id);
      setProcessingStatus('pending');

      // Poll for processing status
      pollProcessingStatus(result.file.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
    }
  };

  const pollProcessingStatus = async (fileId) => {
    const interval = setInterval(async () => {
      try {
        const status = await getUploadStatus(fileId);
        setProcessingStatus(status.status);

        if (status.status === 'complete' || status.status === 'error') {
          clearInterval(interval);
          setUploading(false);
          if (status.error) {
            setError(status.error);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
        clearInterval(interval);
        setUploading(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  const resetUpload = () => {
    setFile(null);
    setUploading(false);
    setUploadProgress(0);
    setProcessingStatus(null);
    setUploadedFileId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentStageIndex = () => {
    return PROCESSING_STAGES.findIndex(stage => stage.key === processingStatus);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CloudArrowUpIcon className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Upload Document</h1>
          <p className="mt-1 text-slate-600 flex items-center space-x-2">
            <SparklesIcon className="w-4 h-4" />
            <span>Upload marketing documents for AI-powered search and discovery</span>
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudArrowUpIcon className="w-16 h-16 mx-auto text-slate-400 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300" />
            <p className="mt-4 text-lg font-medium text-slate-900 group-hover:text-primary-700 transition-colors duration-200">
              Drop your file here, or click to browse
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Supports PDF, DOCX, PPTX, TXT, JPG, PNG (max 100MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info */}
            <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
              <DocumentIcon className="w-10 h-10 text-primary-600" />
              <div className="ml-4 flex-1">
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={resetUpload}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress < 100 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Uploading...</span>
                  <span className="font-medium text-slate-900">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Processing Stages */}
            {processingStatus && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Processing Document</p>
                {PROCESSING_STAGES.map((stage, index) => {
                  const currentIndex = getCurrentStageIndex();
                  const isComplete = index < currentIndex || processingStatus === 'complete';
                  const isCurrent = index === currentIndex;
                  const isError = processingStatus === 'error' && isCurrent;

                  return (
                    <div key={stage.key} className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isError ? 'bg-red-100' :
                        isComplete ? 'bg-green-100' :
                        isCurrent ? 'bg-primary-100' :
                        'bg-slate-100'
                      }`}>
                        {isError ? (
                          <XCircleIcon className="w-5 h-5 text-red-600" />
                        ) : isComplete ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        ) : isCurrent ? (
                          <ArrowPathIcon className="w-5 h-5 text-primary-600 animate-spin" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${
                          isError ? 'text-red-700' :
                          isComplete || isCurrent ? 'text-slate-900' :
                          'text-slate-500'
                        }`}>
                          {stage.label}
                        </p>
                        <p className="text-xs text-slate-500">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {processingStatus === 'complete' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✓ Document processed successfully! You can now search for it.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {!uploading && processingStatus !== 'complete' && (
                <button onClick={handleUpload} className="btn-primary flex-1">
                  Upload & Process
                </button>
              )}
              {processingStatus === 'complete' && (
                <button onClick={resetUpload} className="btn-primary flex-1">
                  Upload Another Document
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Supported Formats */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Supported File Formats</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>PDF</strong> - Portable Document Format</li>
          <li>• <strong>DOCX</strong> - Microsoft Word documents</li>
          <li>• <strong>PPTX</strong> - Microsoft PowerPoint presentations</li>
          <li>• <strong>TXT</strong> - Plain text files</li>
          <li>• <strong>JPG/PNG</strong> - Images with text (OCR enabled)</li>
        </ul>
      </div>
    </div>
  );
}

