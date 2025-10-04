import { motion } from 'framer-motion';
import { FiUploadCloud, FiTarget, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      icon: <FiUploadCloud className="text-5xl" />,
      title: 'Upload Resume',
      description: 'Upload your resume in PDF or DOCX format',
      step: '01',
    },
    {
      icon: <FiTarget className="text-5xl" />,
      title: 'Add Job Description',
      description: 'Paste or upload the job description',
      step: '02',
    },
    {
      icon: <FiDownload className="text-5xl" />,
      title: 'View Match Results',
      description: 'See AI-powered match percentage and missing skills',
      step: '03',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Your Resume, Smarter
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Upload your resume and see how well it matches a job description using AI-powered analysis
          </p>
          {!isAuthenticated && (
            <Link to="/login" className="btn-primary inline-block text-lg">
              Get Started
            </Link>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="card-glow p-8 relative overflow-hidden"
            >
              {/* Step number background */}
              <div className="absolute top-4 right-4 text-6xl font-bold text-purple-500/10">
                {step.step}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-purple-400 mb-4 flex justify-center">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Powered by AI</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>ATS-Optimized</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Instant Results</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
