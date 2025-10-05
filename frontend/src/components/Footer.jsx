import { Link } from 'react-router-dom';
import { FiHeart, FiMail, FiShield, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 border-t border-purple-500/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-glow-purple transition-all">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ResumeRAG
              </span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Transform your resume into an AI-powered opportunity magnet. 
              Match your skills to any job using advanced AI analysis.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>Powered by AI</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>ATS-Optimized</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>Instant Results</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/upload" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <span>Match Resume</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/jobs" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <span>Job Analysis</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/results" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <span>Results</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#privacy" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <FiShield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a 
                  href="#terms" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <FiFileText className="w-4 h-4" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-2"
                >
                  <FiMail className="w-4 h-4" />
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-400 text-sm flex items-center space-x-2">
            <span>© {currentYear} ResumeRAG. All rights reserved.</span>
            <FiHeart className="text-purple-400 w-4 h-4" />
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-xs text-gray-500">
              Built with React & AI
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;