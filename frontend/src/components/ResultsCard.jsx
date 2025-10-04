import { motion } from 'framer-motion';
import { FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ResultsCard = ({ match }) => {
  const { resume, job, matchScore, missingSkills, matchedSkills, downloadUrl } = match;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-red-500/20 border-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="card-glow p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1">{job?.title || 'Job Position'}</h3>
          <p className="text-sm text-gray-400">
            Resume: {resume?.filename || 'resume.pdf'}
          </p>
        </div>
        <div
          className={`text-center px-6 py-3 rounded-lg border ${getScoreBgColor(
            matchScore
          )}`}
        >
          <div className={`text-3xl font-bold ${getScoreColor(matchScore)}`}>
            {matchScore}%
          </div>
          <div className="text-xs text-gray-400 mt-1">Match Score</div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Matched Skills */}
        {matchedSkills && matchedSkills.length > 0 && (
          <div className="bg-dark-300 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FiCheckCircle className="text-green-400" />
              <h4 className="font-semibold text-sm">Matched Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs"
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
              <FiAlertCircle className="text-orange-400" />
              <h4 className="font-semibold text-sm">Missing Skills</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={() => {
          if (downloadUrl) {
            window.open(downloadUrl, '_blank');
          }
        }}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        <FiDownload />
        <span>Download Tailored Resume</span>
      </button>
    </motion.div>
  );
};

export default ResultsCard;
