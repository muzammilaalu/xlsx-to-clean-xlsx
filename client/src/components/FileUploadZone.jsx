import { Upload, X, FileSpreadsheet } from 'lucide-react';
import { useState, useRef } from 'react';

export default function FileUploadZone({ onFileSelect, selectedFile, onRemoveFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`
              p-6 rounded-full transition-all duration-300
              ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your Excel file here
              </h3>
              <p className="text-gray-500 mb-1">or click to browse</p>
              <p className="text-sm text-gray-400">Supports .xlsx and .xls files</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-4 bg-green-100 rounded-xl">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                  File Ready
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
              title="Remove file"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}