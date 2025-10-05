import Job from '../models/Job.js';
import Resume from '../models/Resume.js';

/**
 * Calculate match between resume skills and job requirements
 */
const calculateMatch = (resumeSkills, jobSkills) => {
  console.log('\n=== MATCH CALCULATION DEBUG ===');
  console.log('Resume skills (', resumeSkills.length, '):', resumeSkills);
  console.log('Job skills (', jobSkills.length, '):', jobSkills);
  
  // Input validation
  if (!resumeSkills || !jobSkills || !Array.isArray(resumeSkills) || !Array.isArray(jobSkills)) {
    console.log('Invalid input: skills arrays are not valid');
    return {
      matchPercent: 0,
      missingSkills: jobSkills || [],
      matchedSkills: [],
      overlapCount: 0,
    };
  }
  
  // Handle empty arrays
  if (jobSkills.length === 0) {
    console.log('No job skills to match against');
    return {
      matchPercent: 0,
      missingSkills: [],
      matchedSkills: [],
      overlapCount: 0,
    };
  }
  
  // Normalize and clean skills
  const resumeSkillsNormalized = resumeSkills
    .filter(skill => skill && typeof skill === 'string')
    .map(skill => skill.trim().toLowerCase())
    .filter(skill => skill.length > 0);
    
  const jobSkillsNormalized = jobSkills
    .filter(skill => skill && typeof skill === 'string')
    .map(skill => skill.trim().toLowerCase())
    .filter(skill => skill.length > 0);

  console.log('Resume skills (normalized):', resumeSkillsNormalized);
  console.log('Job skills (normalized):', jobSkillsNormalized);

  // Find exact matches
  const exactMatches = new Set();
  const fuzzyMatches = new Set();
  
  // Check for exact matches first
  jobSkillsNormalized.forEach((jobSkill, jobIndex) => {
    resumeSkillsNormalized.forEach((resumeSkill, resumeIndex) => {
      if (jobSkill === resumeSkill) {
        exactMatches.add(jobIndex);
        return;
      }
    });
  });
  
  // Check for fuzzy matches (skill variations)
  jobSkillsNormalized.forEach((jobSkill, jobIndex) => {
    if (exactMatches.has(jobIndex)) return; // Skip if already exactly matched
    
    resumeSkillsNormalized.forEach((resumeSkill) => {
      if (areSkillsSimilar(jobSkill, resumeSkill)) {
        fuzzyMatches.add(jobIndex);
        return;
      }
    });
  });
  
  const totalMatches = exactMatches.size + fuzzyMatches.size;
  const matchPercent = Math.round((totalMatches / jobSkills.length) * 100);
  
  console.log('Exact matches:', exactMatches.size);
  console.log('Fuzzy matches:', fuzzyMatches.size);
  console.log('Total matches:', totalMatches, '/', jobSkills.length, '=', matchPercent + '%');

  // Find missing skills
  const missingSkills = jobSkills.filter((skill, index) => 
    !exactMatches.has(index) && !fuzzyMatches.has(index)
  );

  // Find matched skills from resume
  const matchedSkills = [];
  exactMatches.forEach(index => {
    const jobSkill = jobSkills[index];
    const matchingResumeSkill = resumeSkills.find(skill => 
      skill.toLowerCase().trim() === jobSkill.toLowerCase().trim()
    );
    if (matchingResumeSkill) {
      matchedSkills.push(matchingResumeSkill);
    }
  });
  
  fuzzyMatches.forEach(index => {
    const jobSkill = jobSkills[index];
    const matchingResumeSkill = resumeSkills.find(skill => 
      areSkillsSimilar(skill.toLowerCase().trim(), jobSkill.toLowerCase().trim())
    );
    if (matchingResumeSkill && !matchedSkills.includes(matchingResumeSkill)) {
      matchedSkills.push(matchingResumeSkill);
    }
  });

  const result = {
    matchPercent,
    missingSkills,
    matchedSkills,
    overlapCount: totalMatches,
  };
  
  console.log('Final match result:', result);
  console.log('=== END MATCH CALCULATION ===\n');
  
  return result;
};

/**
 * Check if two skills are similar (handle common variations)
 */
const areSkillsSimilar = (skill1, skill2) => {
  // Handle common variations
  const variations = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'nodejs': ['node.js', 'node js'],
    'reactjs': ['react', 'react.js'],
    'vuejs': ['vue.js', 'vue js'],
    'css3': ['css'],
    'html5': ['html'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'cpp': ['c++'],
    'csharp': ['c#'],
  };
  
  // Check if skills are in the same variation group
  for (const [base, vars] of Object.entries(variations)) {
    const group = [base, ...vars];
    if (group.includes(skill1) && group.includes(skill2)) {
      return true;
    }
  }
  
  // Check for partial matches (e.g., "react native" contains "react")
  if (skill1.includes(skill2) || skill2.includes(skill1)) {
    return true;
  }
  
  return false;
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
