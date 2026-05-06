import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validationResult, body } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail
} from '../utils/sendEmail.js';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Validation rules for signup
 */
export const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'seller'])
    .withMessage('Role must be user or seller'),
];

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { name, email, password, role, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Create new user (unverified by default)
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
    phone: phone || '',
    isVerified: true, // Temporarily disabled email verification
  });

  // Generate verification token
  // const verificationToken = user.getVerificationToken();
  // await user.save({ validateBeforeSave: false });

  try {
    // await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Direct access enabled.',
    });
  } catch (error) {
    console.error('Nodemailer Error [Signup]:', error.message);
    console.error(error);
    // If email fails, delete the user so they can try again
    await User.findByIdAndDelete(user._id);
    throw new AppError('Verification email could not be sent. Please try again later.', 500);
  }
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Incorrect password or email', 401);
  }

  // Check if password exists (in case of Google Sign-up)
  if (!user.password) {
    throw new AppError('This account was created with Google. Please use Google Sign-In.', 401);
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Incorrect password or email', 401);
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        rating: user.rating,
        totalSales: user.totalSales,
        totalPurchases: user.totalPurchases,
      },
      token,
    },
  });
});

/**
 * @desc    Google Authentication
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    throw new AppError('Google authentication credential is required', 400);
  }

  // Verify the ID token passed by frontend GoogleLogin
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;
  
  // Find user by email
  let user = await User.findOne({ email });

  if (user) {
    // If they exist but don't have a googleId, link it
    if (!user.googleId) {
      user.googleId = sub;
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }
  } else {
    // Completely new user signing up via Google
    user = await User.create({
      name,
      email,
      googleId: sub,
      avatar: picture,
      role: 'user', // default role
    });
  }

  // Issue standard system app token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        rating: user.rating,
        totalSales: user.totalSales,
        totalPurchases: user.totalPurchases,
      },
      token,
    },
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        phoneVisibility: user.phoneVisibility,
        rating: user.rating,
        totalSales: user.totalSales,
        totalPurchases: user.totalPurchases,
        address: user.address,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, phoneVisibility } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address) updateData.address = address;
  if (phoneVisibility && ['public', 'buyers_only', 'private'].includes(phoneVisibility)) {
    updateData.phoneVisibility = phoneVisibility;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        phoneVisibility: user.phoneVisibility,
        address: user.address,
      },
    },
  });
});

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

/**
 * @desc    Become a seller
 * @route   POST /api/auth/become-seller
 * @access  Private
 */
export const becomeSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.role === 'seller') {
    throw new AppError('You are already a seller', 400);
  }

  if (user.role === 'admin') {
    throw new AppError('Admins cannot become sellers', 400);
  }

  user.role = 'seller';
  await user.save();

  res.status(200).json({
    success: true,
    message: 'You are now a seller!',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Since we're using JWT, logout is handled client-side
  // This endpoint can be used for any server-side cleanup if needed
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: false,
    message: 'Password reset temporarily unavailable. Feature coming soon.'
  });
  
  /* Temporarily disabled
  const { email } = req.body;
  if (!email) {
    throw new AppError('Please provide an email', 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('There is no user with that email', 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      data: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error('Nodemailer Error [ForgotPassword]:', error.message);
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('Email could not be sent. Please verify the mail configuration.', 500);
  }
  */
});

/**
 * @desc    Verify Email
 * @route   POST /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken,
    verificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpire = undefined;
  await user.save();

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.warn('Welcome email failed to send:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now login.',
  });
});

/**
 * @desc    Resend Verification Email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide an email', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('No user found with that email', 404);
  }

  if (user.isVerified) {
    throw new AppError('This account is already verified', 400);
  }

  // Generate new token
  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email resent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Nodemailer Error [ResendVerification]:', error.message);
    console.error(error);
    throw new AppError('Email could not be sent due to an internal server issue.', 500);
  }
});

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid token or token has expired', 400);
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Return new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    }
  });
});

export default {
  signup,
  login,
  googleAuth,
  getMe,
  updateProfile,
  updatePassword,
  becomeSeller,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  signupValidation,
  loginValidation,
};
