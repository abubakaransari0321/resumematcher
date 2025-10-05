import { useState } from 'react';
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
import UploadCard from '../components/UploadCard';
import JobDescriptionCard from '../components/JobDescriptionCard';
import MatchResultCard from '../components/MatchResultCard';

const ResumeMatcher = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [jobCreated, setJobCreated] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadSuccess = (response) => {
    console.log('✅ Resume uploaded:', response);
    setResumeData(response);
    setResumeUploaded(true);
    setCurrentStep(2);
  };

  const handleJobCreated = async (response) => {
    console.log('✅ Job created:', response);
    setJobData(response);
    setJobCreated(true);
    setCurrentStep(3);
    
    // Now perform the actual matching
    if (resumeData && response) {
      await performMatching(resumeData, response);
    }
  };
  
  const performMatching = async (resume, job) => {
    setLoading(true);
    try {
      console.log('🔄 Starting match analysis...');
      
      // Call the actual matching API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs/${job.id}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resumeId: resume.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform matching');
      }
      
      const matchData = await response.json();
      console.log('✅ Match result:', matchData);
      
      setMatchResult({
        resume: resume,
        job: job,
        matchScore: matchData.matchScore || 0,
        matchedSkills: matchData.matchedSkills || [],
        missingSkills: matchData.missingSkills || []
      });
      
    } catch (error) {
      console.error('❌ Matching failed:', error);
      // Fallback to demo data if API fails
      setMatchResult({
        resume: resume,
        job: job,
        matchScore: 75,
        matchedSkills: ['JavaScript', 'React', 'CSS', 'HTML'],
        missingSkills: ['TypeScript', 'Node.js'],
        error: 'Using demo data - API matching temporarily unavailable'
      });
    } finally {
      setLoading(false);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          
          {/* Card 1: Upload Resume */}
          <motion.div variants={cardVariants} className="relative">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              currentStep >= 1 ? 'bg-gradient-to-br from-purple-500/10 to-transparent ring-2 ring-purple-500/30' : ''
            }`} />
            
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 h-full transition-all duration-300 hover:border-purple-400/40 hover:shadow-xl hover:shadow-purple-500/10">
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

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full mb-4">
                  <FiUploadCloud className="text-3xl text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Upload Your Resume</h3>
                <p className="text-gray-400">
                  Support for PDF and DOCX formats. Quick and secure upload process.
                </p>
              </div>

              {currentStep === 1 && !resumeUploaded && (
                <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6">
                  <UploadCard onUploadSuccess={handleUploadSuccess} />
                </div>
              )}

              {resumeUploaded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center"
                >
                  <FiCheck className="text-3xl text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-medium">Resume uploaded successfully!</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Card 2: Job Description */}
          <motion.div variants={cardVariants} className="relative">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              currentStep >= 2 ? 'bg-gradient-to-br from-purple-500/10 to-transparent ring-2 ring-purple-500/30' : ''
            }`} />
            
            <div className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 ${
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

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full mb-4">
                  <FiTarget className="text-3xl text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Paste Job Description</h3>
                <p className="text-gray-400">
                  Add the job posting you're interested in or upload the job description file.
                </p>
              </div>

              {currentStep === 2 && resumeUploaded && !jobCreated && (
                <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6">
                  <JobDescriptionCard onJobCreated={handleJobCreated} />
                </div>
              )}

              {currentStep < 2 && (
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 text-center">
                  <FiArrowRight className="text-3xl text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500">Complete step 1 first</p>
                </div>
              )}

              {jobCreated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center"
                >
                  <FiCheck className="text-3xl text-green-400 mx-auto mb-2" />
                  <p className="text-green-300 font-medium">Job description added successfully!</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Card 3: Match Results */}
          <motion.div variants={cardVariants} className="relative">
            <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
              currentStep >= 3 ? 'bg-gradient-to-br from-purple-500/10 to-transparent ring-2 ring-purple-500/30' : ''
            }`} />
            
            <div className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 ${
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

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full mb-4">
                  <FiZap className="text-3xl text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Get AI Match Score</h3>
                <p className="text-gray-400">
                  Instantly see how well you match the role and what skills to highlight.
                </p>
              </div>

              {/* Loading State */}
              {currentStep === 3 && loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-purple-500/30 rounded-xl p-8 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full mb-4 animate-pulse">
                    <FiZap className="text-3xl text-purple-400 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-white">Analyzing Match...</h4>
                  <p className="text-gray-400 text-sm">Our AI is comparing your resume with the job requirements</p>
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-400 border-t-transparent"></div>
                  </div>
                </motion.div>
              )}
              
              {/* Results */}
              {currentStep === 3 && matchResult && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-purple-500/30 rounded-xl"
                >
                  <MatchResultCard match={matchResult} />
                  {matchResult.error && (
                    <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 text-sm">
                      <p>{matchResult.error}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep < 3 && (
                <div className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-6 text-center">
                  <FiArrowRight className="text-3xl text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500">Complete previous steps first</p>
                </div>
              )}
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