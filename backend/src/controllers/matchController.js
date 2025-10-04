import Job from '../models/Job.js';
import Resume from '../models/Resume.js';

/**
 * Calculate match between resume skills and job requirements
 */
const calculateMatch = (resumeSkills, jobSkills) => {
  // Normalize skills for case-insensitive comparison
  const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
  const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

  // Find overlapping skills
  const overlap = resumeSkillsLower.filter(skill => 
    jobSkillsLower.includes(skill)
  );

  // Calculate match percentage
  const matchPercent = jobSkills.length > 0 
    ? Math.round((overlap.length / jobSkills.length) * 100)
    : 0;

  // Find missing skills (case-sensitive from original job skills)
  const missingSkills = jobSkills.filter(skill => 
    !resumeSkillsLower.includes(skill.toLowerCase())
  );

  // Find matched skills (from original resume skills for display)
  const matchedSkills = resumeSkills.filter(skill =>
    jobSkillsLower.includes(skill.toLowerCase())
  );

  return {
    matchPercent,
    missingSkills,
    matchedSkills,
    overlapCount: overlap.length,
  };
};

/**
 * @desc    Match all user's resumes against a specific job
 * @route   POST /api/jobs/:id/match
 * @access  Private
 */
export const matchResumesWithJob = async (req, res) => {
  try {
    // Get the job
    const job = await Job.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
      });
    }

    // Get all user's resumes
    const resumes = await Resume.find({ user_id: req.user._id });

    if (resumes.length === 0) {
      return res.json({
        job_id: job._id,
        job_title: job.title,
        matches: [],
        message: 'No resumes found to match',
      });
    }

    // Calculate matches for each resume
    const matches = resumes.map(resume => {
      const matchResult = calculateMatch(resume.skills, job.skills_required);

      return {
        resume_id: resume._id,
        name: resume.name,
        email: resume.email,
        match_percent: matchResult.matchPercent,
        matched_skills: matchResult.matchedSkills,
        missing_skills: matchResult.missingSkills,
        total_resume_skills: resume.skills.length,
        total_job_skills: job.skills_required.length,
      };
    });

    // Sort by match percentage (descending)
    matches.sort((a, b) => b.match_percent - a.match_percent);

    res.json({
      job_id: job._id,
      job_title: job.title,
      job_skills_required: job.skills_required,
      total_resumes_analyzed: matches.length,
      matches,
    });
  } catch (error) {
    console.error('Match resumes error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error matching resumes with job',
      },
    });
  }
};

/**
 * @desc    Match a specific resume against a specific job
 * @route   POST /api/jobs/:jobId/match/:resumeId
 * @access  Private
 */
export const matchSingleResume = async (req, res) => {
  try {
    // Get the job
    const job = await Job.findOne({
      _id: req.params.jobId,
      user_id: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found',
        },
      });
    }

    // Get the resume
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      user_id: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        error: {
          code: 'RESUME_NOT_FOUND',
          message: 'Resume not found',
        },
      });
    }

    // Calculate match
    const matchResult = calculateMatch(resume.skills, job.skills_required);

    res.json({
      job: {
        id: job._id,
        title: job.title,
        skills_required: job.skills_required,
      },
      resume: {
        id: resume._id,
        name: resume.name,
        email: resume.email,
        skills: resume.skills,
      },
      match: {
        match_percent: matchResult.matchPercent,
        matched_skills: matchResult.matchedSkills,
        missing_skills: matchResult.missingSkills,
        total_resume_skills: resume.skills.length,
        total_job_skills: job.skills_required.length,
      },
    });
  } catch (error) {
    console.error('Match single resume error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error matching resume with job',
      },
    });
  }
};

/**
 * @desc    Get best matching jobs for a specific resume
 * @route   GET /api/resumes/:id/matches
 * @access  Private
 */
export const findJobsForResume = async (req, res) => {
  try {
    // Get the resume
    const resume = await Resume.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        error: {
          code: 'RESUME_NOT_FOUND',
          message: 'Resume not found',
        },
      });
    }

    // Get all user's jobs
    const jobs = await Job.find({ user_id: req.user._id });

    if (jobs.length === 0) {
      return res.json({
        resume_id: resume._id,
        resume_name: resume.name,
        matches: [],
        message: 'No jobs found to match',
      });
    }

    // Calculate matches for each job
    const matches = jobs.map(job => {
      const matchResult = calculateMatch(resume.skills, job.skills_required);

      return {
        job_id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        match_percent: matchResult.matchPercent,
        matched_skills: matchResult.matchedSkills,
        missing_skills: matchResult.missingSkills,
      };
    });

    // Sort by match percentage (descending)
    matches.sort((a, b) => b.match_percent - a.match_percent);

    res.json({
      resume_id: resume._id,
      resume_name: resume.name,
      resume_skills: resume.skills,
      total_jobs_analyzed: matches.length,
      matches,
    });
  } catch (error) {
    console.error('Find jobs for resume error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error finding matching jobs',
      },
    });
  }
};

export default {
  matchResumesWithJob,
  matchSingleResume,
  findJobsForResume,
};
