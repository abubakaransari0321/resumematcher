import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { resumeService } from '../api/resumeService';

const UploadCard = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

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

    try {
      const response = await resumeService.uploadResume(file);
      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess?.(response);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
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
      className="card-glow p-8 max-w-2xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Upload Your Resume</h2>
      <p className="text-center text-gray-400 mb-6">Upload your resume to analyze its match with job descriptions</p>

      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-purple-500/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleChange}
        />

        {!file ? (
          <>
            <FiUpload className="text-6xl text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Drag & Drop your resume here
            </h3>
            <p className="text-gray-400 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Browse Files
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: PDF, DOCX (Max 10MB)
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between bg-dark-300 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiFile className="text-3xl text-purple-400" />
              <div className="text-left">
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {success ? (
              <FiCheck className="text-3xl text-green-500" />
            ) : (
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-300"
              >
                <FiX className="text-2xl" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300"
        >
          Resume uploaded successfully!
        </motion.div>
      )}

      {file && !success && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      )}
    </motion.div>
  );
};

export default UploadCard;
