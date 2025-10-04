import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadCard from '../components/UploadCard';
import { motion } from 'framer-motion';

const Upload = () => {
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setTimeout(() => {
      navigate('/jobs');
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8 text-center"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Upload Resume
        </h1>
        <p className="text-gray-400 text-lg">
          Upload your resume to analyze its match with job descriptions
        </p>
      </motion.div>

      <UploadCard onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default Upload;
