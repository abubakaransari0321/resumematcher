import Resume from '../models/Resume.js';
import { extractSkills, extractCandidateInfo } from '../utils/extractSkills.js';
import { parseFile } from '../utils/pdfParser.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Upload and parse resume
 * @route   POST /api/resumes
 * @access  Private
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'FILE_REQUIRED',
          field: 'file',
          message: 'Please upload a resume file',
        },
      });
    }

    // Parse the file
    const text = await parseFile(req.file);

    if (!text || text.trim().length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: {
          code: 'EMPTY_FILE',
          message: 'Could not extract text from the file',
        },
      });
    }

    // Extract information
    const candidateInfo = extractCandidateInfo(text);
    const skills = extractSkills(text);

    // Get name from body or extracted info
    const name = req.body.name || candidateInfo.name || 'Unknown Candidate';
    const email = req.body.email || candidateInfo.email;
    const phone = req.body.phone || candidateInfo.phone;

    // Create resume record
    const resume = await Resume.create({
      user_id: req.user._id,
      name,
      email,
      phone,
      skills,
      text,
      filename: req.file.originalname,
      filepath: req.file.path,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
    });

    res.status(201).json({
      id: resume._id,
      name: resume.name,
      email: resume.email,
      phone: resume.phone,
      skills: resume.skills,
      uploaded_at: resume.createdAt,
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Upload resume error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error processing resume',
      },
    });
  }
};

/**
 * @desc    Get all resumes for user with pagination
 * @route   GET /api/resumes?limit=10&offset=0&q=search
 * @access  Private
 */
export const getResumes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const searchQuery = req.query.q || '';

    // Build query
    const query = { user_id: req.user._id };

    // Add search if provided
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { skills: { $in: [new RegExp(searchQuery, 'i')] } },
      ];
    }

    // Get resumes with pagination
    const resumes = await Resume.find(query)
      .select('-text -filepath')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    // Get total count
    const total = await Resume.countDocuments(query);

    // Calculate next offset
    const next_offset = offset + limit < total ? offset + limit : null;

    res.json({
      items: resumes.map((resume) => ({
        id: resume._id,
        name: resume.name,
        email: resume.email,
        phone: resume.phone,
        skills: resume.skills,
        filename: resume.filename,
        uploaded_at: resume.createdAt,
      })),
      total,
      limit,
      offset,
      next_offset,
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching resumes',
      },
    });
  }
};

/**
 * @desc    Get single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResumeById = async (req, res) => {
  try {
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

    res.json({
      id: resume._id,
      name: resume.name,
      email: resume.email,
      phone: resume.phone,
      skills: resume.skills,
      text: resume.text,
      filename: resume.filename,
      filesize: resume.filesize,
      mimetype: resume.mimetype,
      uploaded_at: resume.createdAt,
      updated_at: resume.updatedAt,
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching resume',
      },
    });
  }
};

/**
 * @desc    Delete resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = async (req, res) => {
  try {
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

    // Delete file from filesystem
    if (fs.existsSync(resume.filepath)) {
      fs.unlinkSync(resume.filepath);
    }

    // Delete from database
    await resume.deleteOne();

    res.json({
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error deleting resume',
      },
    });
  }
};

/**
 * @desc    Update resume skills
 * @route   PUT /api/resumes/:id/skills
 * @access  Private
 */
export const updateResumeSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    // Validation
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_SKILLS',
          message: 'Skills must be an array',
        },
      });
    }

    // Validate individual skills
    const validatedSkills = skills
      .map(skill => typeof skill === 'string' ? skill.trim() : '')
      .filter(skill => skill.length > 0)
      .filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates

    // Find and update resume
    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user._id,
      },
      {
        skills: validatedSkills,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        error: {
          code: 'RESUME_NOT_FOUND',
          message: 'Resume not found',
        },
      });
    }

    res.json({
      id: resume._id,
      name: resume.name,
      skills: resume.skills,
      updated_at: resume.updatedAt,
    });
  } catch (error) {
    console.error('Update resume skills error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating resume skills',
      },
    });
  }
};

/**
 * @desc    Re-extract skills from resume text
 * @route   POST /api/resumes/:id/reextract-skills
 * @access  Private
 */
export const reextractResumeSkills = async (req, res) => {
  try {
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

    if (!resume.text) {
      return res.status(400).json({
        error: {
          code: 'NO_TEXT_AVAILABLE',
          message: 'No text available for skill extraction',
        },
      });
    }

    // Re-extract skills from stored text
    const newSkills = extractSkills(resume.text);
    
    // Update resume with new skills
    resume.skills = newSkills;
    resume.updatedAt = new Date();
    await resume.save();

    res.json({
      id: resume._id,
      name: resume.name,
      skills: resume.skills,
      total_skills_extracted: newSkills.length,
      updated_at: resume.updatedAt,
    });
  } catch (error) {
    console.error('Re-extract resume skills error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Error re-extracting resume skills',
      },
    });
  }
};

export default {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  updateResumeSkills,
  reextractResumeSkills,
};
