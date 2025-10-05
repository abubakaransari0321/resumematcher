import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { resumeService } from '../api/resumeService';

const UploadCard = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Drag & drop removed for a simpler, contained UI as requested

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    
    console.log('🔄 Starting upload for file:', file.name);

    try {
      const response = await resumeService.uploadResume(file);
      console.log('✅ Upload successful:', response);
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess?.(response);
      }, 1500);
    } catch (err) {
      console.error('❌ Upload failed:', {
        error: err,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.message || 
                          err.message || 
                          'Upload failed. Please try again.';
      
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setSuccess(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow p-6 max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Resume</h2>
      <p className="text-center text-gray-400 mb-5">PDF and DOCX formats supported</p>

      <div className="relative rounded-xl p-6 text-center border border-purple-500/30 bg-slate-900/40">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleChange}
        />

        {!file ? (
          <>
            <FiUpload className="text-5xl text-purple-400 mx-auto mb-3" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Browse Files
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Max 10MB • PDF, DOCX
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between bg-dark-300/60 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiFile className="text-2xl text-purple-400" />
              <div className="text-left">
                <p className="font-semibold truncate max-w-[220px]">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {success ? (
              <FiCheck className="text-2xl text-green-500" />
            ) : (
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-300"
                aria-label="Remove selected file"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm"
        >
          ✓ Resume uploaded successfully!
        </motion.div>
      )}

      {file && !success && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2 px-4"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      )}
    </motion.div>
  );
};

export default UploadCard;
