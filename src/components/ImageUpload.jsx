import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUpload({ onImageSelect, preview, label = 'Upload Image' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  const processFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith('image/')) return;

      setFileName(file.name);
      setFileSize(file.size);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (onImageSelect) onImageSelect(e.target.result, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemove = () => {
    setFileName('');
    setFileSize(0);
    if (inputRef.current) inputRef.current.value = '';
    if (onImageSelect) onImageSelect(null, null);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="label">{label}</span>}

      {preview ? (
        /* Preview state */
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-navy-700">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-52 object-cover"
          />
          {/* File info bar */}
          {fileName && (
            <div className="flex items-center justify-between px-3 py-2 bg-navy-800/90 backdrop-blur-sm">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon size={14} className="text-electric-400 flex-shrink-0" />
                <span className="text-xs text-slate-300 truncate">{fileName}</span>
                <span className="text-xs text-slate-500 flex-shrink-0">({formatBytes(fileSize)})</span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="ml-2 flex-shrink-0 text-slate-400 hover:text-red-400 transition-colors"
                aria-label="Remove image"
              >
                <X size={15} />
              </button>
            </div>
          )}
          {/* Quick remove if no file name (URL preview) */}
          {!fileName && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full p-1 transition-colors"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed
            cursor-pointer transition-all duration-200
            ${dragging
              ? 'border-electric-500 bg-electric-500/10 scale-[1.01]'
              : 'border-white/20 bg-navy-700/50 hover:border-electric-500/60 hover:bg-navy-700'
            }`}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-navy-700 border border-white/10">
            <UploadCloud size={22} className="text-electric-400" />
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm font-medium">
              Drag & drop or{' '}
              <span className="text-electric-400 underline underline-offset-2">browse</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">PNG, JPG, WEBP up to 5 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
