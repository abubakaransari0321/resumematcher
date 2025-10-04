import Resume from '../models/Resume.js';
import { extractSkills, extractCandidateInfo } from '../utils/extractSkills.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse text from uploaded file
 */
const parseFile = async (file) => {
  try {
    console.log('Parsing file:', file.path, 'Type:', file.mimetype);
    if (!fs.existsSync(file.path)) {
      throw new Error(`File not found: ${file.path}`);
    }
    const fileBuffer = fs.readFileSync(file.path);

    if (file.mimetype === 'application/pdf') {
      // Use pdf-parse to extract text from PDF
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(fileBuffer);
        return data.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        // Fallback to treating as plain text
        return fileBuffer.toString('utf-8');
      }
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      // For DOCX, we'll do simple text extraction
      // In production, consider using mammoth or docx-parser
      return fileBuffer.toString('utf-8');
    } else {
      // Fallback to plain text
      return fileBuffer.toString('utf-8');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error('Failed to parse file');
  }
};

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

export default {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
};
