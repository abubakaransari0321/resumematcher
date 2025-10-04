import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'name',
          message: 'Name is required',
        },
      });
    }

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'email',
          message: 'Email is required',
        },
      });
    }

    if (!password) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'password',
          message: 'Password is required',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PASSWORD',
          field: 'password',
          message: 'Password must be at least 6 characters',
        },
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          field: 'email',
          message: 'User with this email already exists',
        },
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({
        error: {
          code: 'INVALID_USER_DATA',
          message: 'Invalid user data',
        },
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error during registration',
      },
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'email',
          message: 'Email is required',
        },
      });
    }

    if (!password) {
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'password',
          message: 'Password is required',
        },
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error during login',
      },
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error',
      },
    });
  }
};

export default { register, login, getMe };
