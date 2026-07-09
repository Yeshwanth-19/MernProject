import crypto from 'crypto';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendPasswordResetEmail } from '../utils/sendEmail.js';
import { verifyGoogleToken } from '../utils/verifyGoogleToken.js';
import { resolveEncryptedPassword } from '../utils/crypto.js';

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        message: 'Please provide name, email, password, and mobile number',
      });
    }

    let plainPassword = password;


    try {
      plainPassword = resolveEncryptedPassword(password, true);
    } catch (decryptError) {
      console.error(decryptError);
      return res.status(400).json({ message: 'Invalid encrypted password' });
    }


    if (plainPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExist = await User.findOne({ email: normalizedEmail });

    if (userExist) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      mobile,
      password: hashedPassword,
      role: role,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: formatUserResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ');
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    let plainPassword = password;
    try {
      plainPassword = resolveEncryptedPassword(password, true);
    } catch (decryptError) {
      console.error(decryptError);
      return res.status(400).json({ message: 'Invalid encrypted password' });
    }


    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({
        message: 'This account uses Google sign in. Please continue with Google.',
      });
    }

    const match = await bcrypt.compare(plainPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      user: formatUserResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  avatar: user.avatar,
  kycVerified: user.kycVerified,
  kycStatus: user.kycStatus,
  kycVerifiedAt: user.kycVerifiedAt,
  kycSubmittedAt: user.kycSubmittedAt,
  kycRejectionReason: user.kycRejectionReason,
});

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google login is not configured on the server' });
    }

    const googleUser = await verifyGoogleToken(credential);

    if (!googleUser.emailVerified) {
      return res.status(400).json({ message: 'Google email is not verified' });
    }

    let user = await User.findOne({ googleId: googleUser.googleId });

    if (!user) {
      user = await User.findOne({ email: googleUser.email });

      if (user) {
        user.googleId = googleUser.googleId;
        if (!user.avatar && googleUser.picture) {
          user.avatar = googleUser.picture;
        }
        await user.save();
      } else {
        user = await User.create({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          avatar: googleUser.picture,
          role: 'trader',
        });
      }
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid Google credentials' });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with that email, a reset link has been sent',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = hashResetToken(resetToken);
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    try {
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        resetToken,
      });

      const response = {
        message: 'If an account exists with that email, a reset link has been sent',
        emailSent: emailResult.emailSent,
      };

      if (!emailResult.emailSent && process.env.NODE_ENV !== 'production') {
        response.resetToken = resetToken;
        response.resetUrl = emailResult.resetUrl;
        if (emailResult.previewUrl) {
          response.previewUrl = emailResult.previewUrl;
        }
      }

      res.status(200).json(response);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error(emailError);
      res.status(500).json({ message: 'Failed to send password reset email. Please try again later.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Please provide token and new password' });
    }

    let plainPassword = password;


    try {
      plainPassword = resolveEncryptedPassword(password, true);
    } catch (decryptError) {
      console.error(decryptError);
      return res.status(400).json({ message: 'Invalid encrypted password' });
    }


    if (plainPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = hashResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(plainPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
