import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import ProgressRing from './ProgressRing';

const MatchResultCard = ({ match, onRerun }) => {
  const { resume, job, matchScore, missingSkills, matchedSkills } = match;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="card-glow p-6"
    >
      {/* Header with Progress Ring */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        <div className="flex-shrink-0">
          <ProgressRing percentage={matchScore} size={120} />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-2">{job?.title || 'Job Position'}</h3>
          <p className="text-sm text-gray-400 mb-1">
            Resume: {resume?.filename || resume?.name || 'resume.pdf'}
          </p>
          <p className="text-lg font-semibold text-purple-400">
            {matchScore >= 80 && '🎉 Excellent Match!'}
            {matchScore >= 60 && matchScore < 80 && '✨ Good Match'}
            {matchScore < 60 && '⚠️ Needs Improvement'}
          </p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Matched Skills */}
        {matchedSkills && matchedSkills.length > 0 && (
          <div className="bg-dark-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FiCheckCircle className="text-green-400 text-xl" />
              <h4 className="font-semibold">Matched Skills ({matchedSkills.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills && missingSkills.length > 0 && (
          <div className="bg-dark-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FiAlertCircle className="text-orange-400 text-xl" />
              <h4 className="font-semibold">Missing Skills ({missingSkills.length})</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Re-run Match Button */}
      {onRerun && (
        <button
          onClick={() => onRerun(job?.id)}
          className="btn-secondary w-full flex items-center justify-center space-x-2"
        >
          <FiRefreshCw />
          <span>Re-run Match Analysis</span>
        </button>
      )}
    </motion.div>
  );
};

export default MatchResultCard;
