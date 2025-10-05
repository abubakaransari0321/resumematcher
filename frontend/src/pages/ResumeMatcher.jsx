import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiFileText, 
  FiZap, 
  FiTarget,
  FiCheck,
  FiArrowRight,
  FiStar
} from 'react-icons/fi';
import { resumeService } from '../api/resumeService';
import JobDescriptionCard from '../components/JobDescriptionCard';
import MatchResultCard from '../components/MatchResultCard';

const ResumeMatcher = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobCreated, setJobCreated] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PDF or DOCX file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setUploadError('');
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadError('');
    
    try {
      const response = await resumeService.uploadResume(selectedFile);
      console.log('✅ Resume uploaded:', response);
      setResumeData(response);
      setResumeUploaded(true);
      setCurrentStep(2);
    } catch (error) {
      console.error('❌ Upload failed - Full error details:', {
        error: error,
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.message === 'Network Error') {
        errorMessage = 'Network Error: Backend server may be starting up. Please wait 30 seconds and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleJobCreated = async (response) => {
    console.log('✅ Job created:', response);
    setJobData(response);
    setJobCreated(true);
    setCurrentStep(3);
    
    // Store match data in localStorage for Results page
    const matchData = {
      resume: resumeData,
      job: response,
      timestamp: Date.now()
    };
    localStorage.setItem('lastMatch', JSON.stringify(matchData));
    
    // Set completion flag
    setMatchResult({
      resume: resumeData,
      job: response,
      completed: true
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
  };

  const stepIndicatorVariants = {
    inactive: { scale: 0.8, opacity: 0.5 },
    active: { scale: 1, opacity: 1 },
    completed: { scale: 1, opacity: 1, backgroundColor: "#10b981" }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-12 text-center"
      >
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-6 py-2 mb-6"
        >
          <FiStar className="text-purple-400" />
          <span className="text-sm font-medium text-purple-300">AI-Powered Resume Matching</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            Match Your Resume
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            To Any Job
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
        >
          Upload your resume and job description to get an instant AI-powered match score 
          and personalized recommendations to improve your chances.
        </motion.p>

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center items-center space-x-4 md:space-x-8 mb-12"
        >
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                variants={stepIndicatorVariants}
                animate={
                  step < currentStep ? 'completed' :
                  step === currentStep ? 'active' : 'inactive'
                }
                className="relative"
              >
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${
                  step < currentStep 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step === currentStep 
                      ? 'border-purple-500 text-purple-300 bg-purple-500/10' 
                      : 'border-gray-600 text-gray-500'
                }`}>
                  {step < currentStep ? <FiCheck /> : step}
                </div>
                {step < currentStep && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"
                  />
                )}
              </motion.div>
              {step < 3 && (
                <div className={`w-8 md:w-16 h-px mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Main Content Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-start">
          
          {/* Card 1: Upload Resume */}
          <motion.div variants={cardVariants} className="relative">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              currentStep >= 1 ? 'bg-gradient-to-br from-purple-500/10 to-transparent ring-2 ring-purple-500/30' : ''
            }`} />
            
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 min-h-[400px] max-h-[500px] transition-all duration-300 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col">
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full text-white font-bold text-sm shadow-lg">
                  1
                </div>
                {resumeUploaded && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400"
                  >
                    <FiCheck className="text-xl" />
                  </motion.div>
                )}
              </div>

              <div className="text-center mb-4 flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mb-3">
                  <FiUploadCloud className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Upload Your Resume</h3>
                <p className="text-gray-400 text-sm">
                  PDF and DOCX formats supported
                </p>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                {currentStep === 1 && !resumeUploaded && (
                  <div className="text-center">
                    {!selectedFile ? (
                      <>
                        <FiUploadCloud className="text-4xl text-purple-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label
                          htmlFor="resume-upload"
                          className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105"
                        >
                          Browse Files
                        </label>
                        <p className="text-xs text-gray-500 mt-3">
                          Max 10MB • PDF, DOCX
                        </p>
                      </>
                    ) : (
                      <div className="bg-slate-800/60 border border-purple-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <FiFileText className="text-2xl text-purple-400" />
                          <div className="text-left">
                            <p className="font-medium text-white text-sm truncate max-w-[160px]">{selectedFile.name}</p>
                            <p className="text-xs text-gray-400">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {uploading ? 'Uploading...' : 'Upload Resume'}
                        </button>
                      </div>
                    )}
                    
                    {uploadError && (
                      <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-xs">
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}

                {resumeUploaded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center"
                  >
                    <FiCheck className="text-2xl text-green-400 mx-auto mb-2" />
                    <p className="text-green-300 font-medium text-sm">Resume uploaded successfully!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Job Description */}
          <motion.div variants={cardVariants} className="relative">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              currentStep >= 2 ? 'bg-gradient-to-br from-purple-500/10 to-transparent ring-2 ring-purple-500/30' : ''
            }`} />
            
            <div className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border rounded-2xl p-6 min-h-[400px] max-h-[500px] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col ${
              currentStep >= 2 ? 'border-purple-500/20 hover:border-purple-400/40' : 'border-gray-600/50'
            }`}>
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm shadow-lg ${
                  currentStep >= 2 ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gray-600'
                }`}>
                  2
                </div>
                {jobCreated && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400"
                  >
                    <FiCheck className="text-xl" />
                  </motion.div>
                )}
              </div>

              <div className="text-center mb-4 flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mb-3">
                  <FiTarget className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Job Description</h3>
                <p className="text-gray-400 text-sm">
                  Paste or upload job posting
                </p>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                {currentStep === 2 && resumeUploaded && !jobCreated && (
                  <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-4 overflow-hidden">
                    <div className="max-h-[200px] overflow-y-auto">
                      <JobDescriptionCard onJobCreated={handleJobCreated} />
                    </div>
                  </div>
                )}

                {currentStep < 2 && (
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-center">
                    <FiArrowRight className="text-2xl text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Complete step 1 first</p>
                  </div>
                )}

                {jobCreated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center"
                  >
                    <FiCheck className="text-2xl text-green-400 mx-auto mb-2" />
                    <p className="text-green-300 font-medium text-sm">Job description added successfully!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Match Results */}
          <motion.div variants={cardVariants} className="relative">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              currentStep >= 3 ? 'bg-gradient-to-br from-purple-500/10 to-transparent ring-2 ring-purple-500/30' : ''
            }`} />
            
            <div className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border rounded-2xl p-6 min-h-[400px] max-h-[500px] transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col ${
              currentStep >= 3 ? 'border-purple-500/20 hover:border-purple-400/40' : 'border-gray-600/50'
            }`}>
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm shadow-lg ${
                  currentStep >= 3 ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gray-600'
                }`}>
                  3
                </div>
                {matchResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400"
                  >
                    <FiCheck className="text-xl" />
                  </motion.div>
                )}
              </div>

              <div className="text-center mb-4 flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mb-3">
                  <FiZap className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">AI Match Score</h3>
                <p className="text-gray-400 text-sm">
                  Instant analysis & recommendations
                </p>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                {/* Completion State - No Demo Results */}
                {currentStep === 3 && matchResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-green-500/30 rounded-xl p-6 text-center"
                  >
                    {/* Success Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                      <FiCheck className="text-3xl text-green-400" />
                    </div>
                    
                    <h4 className="text-xl font-semibold mb-2 text-white">Analysis Complete!</h4>
                    <p className="text-gray-400 text-sm mb-6">
                      Your resume and job description have been processed. View detailed match results and recommendations.
                    </p>
                    
                    {/* View Results Button */}
                    <button
                      onClick={() => {
                        console.log('Navigating to results page...');
                        navigate('/results');
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <FiZap className="text-lg" />
                      <span>View Match Results</span>
                      <FiArrowRight className="text-lg" />
                    </button>
                  </motion.div>
                )}

                {currentStep < 3 && (
                  <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-center">
                    <FiArrowRight className="text-2xl text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Complete previous steps first</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom CTA */}
        {currentStep < 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-2xl border border-purple-500/20">
              <h3 className="text-xl font-semibold mb-2 text-white">Ready to boost your job search?</h3>
              <p className="text-gray-400 mb-4">
                Get instant feedback on how well your resume matches job requirements
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span>AI-Powered Analysis</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span>Instant Results</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  <span>ATS Optimized</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResumeMatcher;