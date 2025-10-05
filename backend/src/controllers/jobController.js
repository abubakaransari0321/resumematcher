import Job from '../models/Job.js';
import { extractSkills } from '../utils/extractSkills.js';
import { parseFile } from '../utils/pdfParser.js';
import fs from 'fs';

/**
 * @desc    Create job description
 * @route   POST /api/jobs
 * @access  Private
 */
export const createJob = async (req, res) => {
  try {
    const { title, description, company, location } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'title',
          message: 'Job title is required',
        },
      });
    }

    if (!description) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'description',
          message: 'Job description is required',
        },
      });
    }

    // Extract required skills from description
    const skills_required = extractSkills(title + ' ' + description);

    // Create job
    const job = await Job.create({
      user_id: req.user._id,
      title,
      description,
      company,
      location,
      skills_required,
    });

    res.status(201).json({
      id: job._id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skills_required: job.skills_required,
      created_at: job.createdAt,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error creating job',
      },
    });
  }
};

/**
 * Parse text from uploaded job description file
 * Now using the robust PDF parser utility
 */
const parseJobFile = parseFile;

/**
 * @desc    Upload and parse job description file
 * @route   POST /api/jobs/upload
 * @access  Private
 */
export const uploadJobDescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'FILE_REQUIRED',
          field: 'file',
          message: 'Please upload a job description file',
        },
      });
    }

    // Parse the file
    const text = await parseJobFile(req.file);

    if (!text || text.trim().length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: {
          code: 'EMPTY_FILE',
          message: 'Could not extract text from the job description file',
        },
      });
    }

    // Extract title from the first line or use default
    const lines = text.split('\n').filter(line => line.trim());
    const title = req.body.title || lines[0]?.trim() || 'Job Position';
    
    // Extract required skills from description
    const skills_required = extractSkills(text);

    // Create job
    const job = await Job.create({
      user_id: req.user._id,
      title,
      description: text,
      company: req.body.company,
      location: req.body.location,
      skills_required,
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      id: job._id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skills_required: job.skills_required,
      created_at: job.createdAt,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload job description error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error processing job description',
      },
    });
  }
};

/**
 * @desc    Get all jobs for user with pagination
 * @route   GET /api/jobs?limit=10&offset=0
 * @access  Private
 */
export const getJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Get jobs with pagination
    const jobs = await Job.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Get total count
    const total = await Job.countDocuments({ user_id: req.user._id });

    // Calculate next offset
    const next_offset = offset + limit < total ? offset + limit : null;

    res.json({
      items: jobs.map((job) => ({
        id: job._id,
        title: job.title,
        description: job.description,
        company: job.company,
        location: job.location,
        skills_required: job.skills_required,
        created_at: job.createdAt,
      })),
      total,
      limit,
      offset,
      next_offset,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching jobs',
      },
    });
  }
};

/**
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 */
export const getJobById = async (req, res) => {
  try {
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

    res.json({
      id: job._id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skills_required: job.skills_required,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching job',
      },
    });
  }
};

/**
 * @desc    Update job
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
export const updateJob = async (req, res) => {
  try {
    const { title, description, company, location } = req.body;

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

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;

    // Re-extract skills if title or description changed
    if (title || description) {
      const combinedText = (title || job.title) + ' ' + (description || job.description);
      job.skills_required = extractSkills(combinedText);
    }

    await job.save();

    res.json({
      id: job._id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: job.location,
      skills_required: job.skills_required,
      updated_at: job.updatedAt,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating job',
      },
    });
  }
};

/**
 * @desc    Delete job
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
export const deleteJob = async (req, res) => {
  try {
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

    await job.deleteOne();

    res.json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error deleting job',
      },
    });
  }
};

export default {
  createJob,
  uploadJobDescription,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};
