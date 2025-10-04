import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFileText, FiCheck } from 'react-icons/fi';
import { jobService } from '../api/jobService';

const JobDescriptionCard = ({ onJobCreated }) => {
  const [jobText, setJobText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState('text'); // 'text' or 'file'
  const fileInputRef = useRef(null);

  const handleTextSubmit = async () => {
    if (!jobText.trim() || !jobTitle.trim()) {
      setError('Please provide both job title and description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await jobService.createJob({
        title: jobTitle,
        description: jobText,
      });
      setSuccess(true);
      setTimeout(() => {
        onJobCreated?.(response);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const response = await jobService.uploadJobDescription(file);
      setSuccess(true);
      setTimeout(() => {
        onJobCreated?.(response);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload job description');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow p-8 max-w-3xl mx-auto"
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Add Job Description</h2>
      <p className="text-center text-gray-400 mb-6">Add a job description to see how well resumes match</p>

      {/* Mode Toggle */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setMode('text')}
          className={`px-6 py-2 rounded-lg transition-all ${
            mode === 'text'
              ? 'bg-purple-600 text-white'
              : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
          }`}
        >
          <FiFileText className="inline mr-2" />
          Paste Text
        </button>
        <button
          onClick={() => setMode('file')}
          className={`px-6 py-2 rounded-lg transition-all ${
            mode === 'file'
              ? 'bg-purple-600 text-white'
              : 'bg-dark-300 text-gray-400 hover:bg-dark-200'
          }`}
        >
          <FiUpload className="inline mr-2" />
          Upload File
        </button>
      </div>

      {mode === 'text' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Job Description
            </label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job description here..."
              rows={12}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleTextSubmit}
            disabled={loading || !jobText.trim() || !jobTitle.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Match'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 hover:border-purple-500/50 rounded-xl p-12 text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
            />

            {!file ? (
              <>
                <FiUpload className="text-6xl text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Upload Job Description
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: PDF, DOCX, TXT
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <FiFileText className="text-3xl text-purple-400" />
                <div className="text-left">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {success && <FiCheck className="text-2xl text-green-500" />}
              </div>
            )}
          </div>

          {file && !success && (
            <button
              onClick={handleFileUpload}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Analyze Match'}
            </button>
          )}
        </div>
      )}

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
          Job description saved successfully!
        </motion.div>
      )}
    </motion.div>
  );
};

export default JobDescriptionCard;
