import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DragDropOCR = ({ onExtract, isUploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload a PDF or Image.");
      return;
    }
    setFile(selectedFile);
    onExtract(selectedFile);
  };

  const clearFile = () => {
    setFile(null); setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full bg-card p-6 rounded-2xl border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-200">OCR Report Scanner</h3>
          <p className="text-sm text-gray-500">Upload lab results to auto-fill parameters</p>
        </div>
        <span className="text-xs text-primary font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">AUTO-FILL</span>
      </div>
      
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[220px] group
          ${dragActive ? 'border-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)] scale-[1.02]' : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-gray-500 hover:shadow-lg'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange} disabled={isUploading} />
        
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div key="uploading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-primary font-medium">Extracting medical parameters...</p>
              <p className="text-xs text-gray-500 mt-1">Applying OCR models</p>
            </motion.div>
          ) : file ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
              <CheckCircle size={40} className="text-success mb-2" />
              <p className="text-sm text-gray-300 font-medium">{file.name}</p>
              <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-danger transition-colors">
                <X size={14} /> Remove File
              </button>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center">
              <div className="bg-gray-800/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud size={32} className="text-primary" />
              </div>
              <p className="text-sm text-gray-200 font-bold tracking-wide">Drag & drop report here</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-[10px] font-semibold text-gray-400">PDF, PNG, JPG</span>
                <span className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-[10px] font-semibold text-gray-400">Max 20 MB</span>
                <span className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-semibold text-primary">OCR Ready</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2 text-sm text-danger">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default DragDropOCR;
