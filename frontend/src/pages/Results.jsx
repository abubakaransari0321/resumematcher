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
      // First, check if we have a recent match from localStorage
      const lastMatch = localStorage.getItem('lastMatch');
      if (lastMatch) {
        try {
          const matchData = JSON.parse(lastMatch);
          console.log('Found stored match data:', matchData);
          
          // Check if it's recent (within last hour)
          const isRecent = (Date.now() - matchData.timestamp) < (60 * 60 * 1000);
          
          if (isRecent && matchData.resume && matchData.job) {
            console.log('Using recent match data for analysis...');
            await performSingleMatch(matchData.resume, matchData.job);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing stored match data:', parseError);
          localStorage.removeItem('lastMatch'); // Clear corrupted data
        }
      }
      
      // Fallback: Get all jobs and resumes for the user
      console.log('Loading all matches...');
      const [jobsResponse, resumesResponse] = await Promise.all([
        jobService.getJobs(100, 0),
        resumeService.getResumes(100, 0)
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
          console.log(`Match response for job ${job.title}:`, matchResponse);
          
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
      console.log('Final matches:', allMatches);
      setMatches(allMatches);
      setLoading(false);
    } catch (err) {
      console.error('Error loading matches:', err);
      
      // Show detailed error information
      const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error';
      const errorStatus = err.response?.status || 'No status';
      
      console.error('API Error Details:', {
        message: errorMessage,
        status: errorStatus,
        url: err.config?.url,
        method: err.config?.method
      });
      
      // Try to show demo data as fallback
      console.log('Showing demo data as fallback...');
      const demoMatches = [
        {
          id: 'demo-match-1',
          resume: {
            id: 'demo-resume-1',
            name: 'Your Resume',
            filename: 'resume.pdf'
          },
          job: {
            id: 'demo-job-1',
            title: 'Software Developer',
            description: 'Full-stack development position...',
            company: 'Tech Company',
            location: 'Remote'
          },
          matchScore: 75,
          matchedSkills: ['JavaScript', 'React', 'Node.js', 'CSS', 'HTML'],
          missingSkills: ['TypeScript', 'Python', 'AWS']
        }
      ];
      
      setMatches(demoMatches);
      setError(`Demo Mode: ${errorMessage}`);
      setLoading(false);
    }
  };
  
  const performSingleMatch = async (resume, job) => {
    try {
      console.log('Performing single match for:', { resume: resume.name, job: job.title });
      
      // Call the match API for this specific job
      const matchResponse = await jobService.matchResumes(job.id);
      console.log('Single match response:', matchResponse);
      
      if (matchResponse.matches && matchResponse.matches.length > 0) {
        // Find the match for our specific resume
        const specificMatch = matchResponse.matches.find(match => match.resume_id === resume.id);
        
        if (specificMatch) {
          const singleMatch = {
            id: `${job.id}-${resume.id}`,
            resume: {
              id: resume.id,
              name: resume.name,
              filename: `${resume.name}.pdf`
            },
            job: {
              id: job.id,
              title: job.title,
              description: job.description,
              company: job.company,
              location: job.location
            },
            matchScore: specificMatch.match_percent,
            matchedSkills: specificMatch.matched_skills,
            missingSkills: specificMatch.missing_skills
          };
          
          console.log('Single match result:', singleMatch);
          setMatches([singleMatch]);
        } else {
          console.log('No match found for resume', resume.id);
          setMatches([]);
        }
      } else {
        console.log('No matches returned from API');
        setMatches([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error performing single match:', error);
      
      // Show detailed error information
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
      const errorStatus = error.response?.status || 'No status';
      
      console.error('Single Match API Error Details:', {
        message: errorMessage,
        status: errorStatus,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Show demo match for the specific resume/job
      console.log('Creating demo match for stored data...');
      const demoMatch = {
        id: `demo-${resume.id}-${job.id}`,
        resume: {
          id: resume.id,
          name: resume.name || 'Your Resume',
          filename: `${resume.name || 'resume'}.pdf`
        },
        job: {
          id: job.id,
          title: job.title || 'Job Position',
          description: job.description || 'Job description...',
          company: job.company || 'Company',
          location: job.location || 'Location'
        },
        matchScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100%
        matchedSkills: ['JavaScript', 'React', 'CSS', 'HTML', 'Node.js'],
        missingSkills: ['TypeScript', 'Python', 'AWS', 'Docker']
      };
      
      setMatches([demoMatch]);
      setError(`Demo Mode: Using sample data (${errorMessage})`);
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
        <div className="max-w-6xl mx-auto mb-8">
          <div className={`p-6 border rounded-lg ${
            error.startsWith('Demo Mode') 
              ? 'bg-orange-500/20 border-orange-500 text-orange-300' 
              : 'bg-red-500/20 border-red-500 text-red-300'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              error.startsWith('Demo Mode') ? 'text-orange-200' : 'text-red-200'
            }`}>
              {error.startsWith('Demo Mode') ? '⚠️ Demo Mode Active' : 'Error Loading Results'}
            </h3>
            <p className="mb-4">{error}</p>
            {error.startsWith('Demo Mode') ? (
              <div className="text-sm text-orange-400">
                <p>Showing sample match data. The API may be temporarily unavailable.</p>
              </div>
            ) : (
              <div className="text-sm text-red-400">
                <p>Possible solutions:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Make sure you're logged in</li>
                  <li>Try uploading a resume and job description first</li>
                  <li>Check your internet connection</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
            <button
              onClick={() => window.location.href = '/matcher'}
              className={`mt-4 px-4 py-2 text-white rounded-lg transition-colors ${
                error.startsWith('Demo Mode') 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Go back to Resume Matcher
            </button>
          </div>
        </div>
      )}

      {matches.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="p-12 bg-slate-800/80 rounded-2xl border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-4 text-white">No Match Results Yet</h2>
            <p className="text-xl text-gray-400 mb-4">
              Upload a resume and add a job description to see the match analysis
            </p>
            <button
              onClick={() => window.location.href = '/matcher'}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Go to Resume Matcher
            </button>
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
