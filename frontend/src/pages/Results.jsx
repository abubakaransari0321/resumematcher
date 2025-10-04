import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MatchResultCard from '../components/MatchResultCard';
import { jobService } from '../api/jobService';
import { resumeService } from '../api/resumeService';

const Results = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Get all jobs and resumes for the user
      const [jobsResponse, resumesResponse] = await Promise.all([
        jobService.getJobs(1, 100),
        resumeService.getResumes(1, 100)
      ]);

      const jobs = jobsResponse.items || [];
      const resumes = resumesResponse.items || [];

      if (jobs.length === 0 || resumes.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Generate matches for each job
      const allMatches = [];
      for (const job of jobs) {
        try {
          const matchResponse = await jobService.matchResumes(job.id);
          if (matchResponse.matches && matchResponse.matches.length > 0) {
            // Transform the API response to match our component expectations
            const jobMatches = matchResponse.matches.map(match => ({
              id: `${job.id}-${match.resume_id}`,
              resume: {
                id: match.resume_id,
                name: match.name,
                filename: `${match.name}.pdf`
              },
              job: {
                id: job.id,
                title: job.title,
                description: job.description,
                company: job.company,
                location: job.location
              },
              matchScore: match.match_percent,
              matchedSkills: match.matched_skills,
              missingSkills: match.missing_skills
            }));
            allMatches.push(...jobMatches);
          }
        } catch (matchError) {
          console.error(`Error matching job ${job.title}:`, matchError);
        }
      }

      // Sort by match score descending
      allMatches.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(allMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Failed to load match results');
      setLoading(false);
    }
  };

  const handleRerunMatch = async (jobId) => {
    setLoading(true);
    try {
      // Re-run matching for specific job
      await jobService.matchResumes(jobId);
      // Reload all matches
      await loadMatches();
    } catch (err) {
      console.error('Error re-running match:', err);
      setError('Failed to re-run match');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-white font-semibold mb-2">AI Match in Progress...</p>
          <p className="text-gray-400">Analyzing resume-job compatibility</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8 text-center"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Resume Match Results
        </h1>
        <p className="text-gray-400 text-lg">
          AI-powered resume-job compatibility analysis
        </p>
      </motion.div>

      {error && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="card-glow p-12">
            <p className="text-xl text-gray-400 mb-4">
              No match results yet
            </p>
            <p className="text-gray-500">
              Upload a resume and add a job description to see the match analysis
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MatchResultCard match={match} onRerun={handleRerunMatch} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
