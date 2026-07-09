import User from '../models/User.js';
import { encryptAes, resolveEncryptedValue } from '../utils/crypto.js';

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

const formatPendingKyc = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || 'Not provided',
  kycStatus: user.kycStatus,
  kycSubmittedAt: user.kycSubmittedAt,
  documents: {
    aadhaarFront: user.kycDocuments?.aadhaarFront,
    aadhaarBack: user.kycDocuments?.aadhaarBack,
    panCard: user.kycDocuments?.panCard,
  },
});

export const submitKyc = async (req, res) => {
  try {
    const { fullName, panNumber, aadhaarLast, isEncrypted } = req.body;
    const files = req.files || {};

    if (!fullName || !panNumber || !aadhaarLast) {
      return res.status(400).json({
        message: 'Please provide full name, PAN number, and Aadhaar last 4 digits',
      });
    }

    if (!files.aadhaarFront?.[0] || !files.aadhaarBack?.[0] || !files.panCard?.[0]) {
      return res.status(400).json({
        message: 'Please upload Aadhaar front, Aadhaar back, and PAN card documents',
      });
    }

    let plainPan = panNumber;
    let plainaadhaarLast = aadhaarLast;

    if (isEncrypted === 'true' || isEncrypted === true) {
      try {
        plainPan = resolveEncryptedValue(panNumber, true);
        plainaadhaarLast = resolveEncryptedValue(aadhaarLast, true);
      } catch (decryptError) {
        console.error(decryptError);
        return res.status(400).json({ message: 'Invalid encrypted KYC data' });
      }
    }

    const normalizedPan = plainPan.trim().toUpperCase();
    const normalizedaadhaarLast = plainaadhaarLast.trim();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(normalizedPan)) {
      return res.status(400).json({ message: 'Enter a valid PAN number' });
    }

    if (!/^[0-9]{12}$/.test(normalizedaadhaarLast)) {
      return res.status(400).json({ message: 'Enter valid Aadhaar last 4 digits' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus === 'approved' || user.kycVerified) {
      return res.status(200).json({
        message: 'KYC already verified',
        user: formatUserResponse(user),
      });
    }

    if (user.kycStatus === 'pending') {
      return res.status(400).json({
        message: 'Your KYC is already submitted and pending admin verification',
        user: formatUserResponse(user),
      });
    }

    user.name = fullName.trim();
    user.encryptedPan = encryptAes(normalizedPan);
    user.aadhaarLast = encryptAes(normalizedaadhaarLast);
    user.kycDocuments = {
      aadhaarFront: `/uploads/kyc/${files.aadhaarFront[0].filename}`,
      aadhaarBack: `/uploads/kyc/${files.aadhaarBack[0].filename}`,
      panCard: `/uploads/kyc/${files.panCard[0].filename}`,
    };
    user.kycStatus = 'pending';
    user.kycVerified = false;
    user.kycVerifiedAt = undefined;
    user.kycSubmittedAt = new Date();
    user.kycRejectionReason = undefined;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: 'KYC submitted successfully. Waiting for admin verification.',
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ');
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: error.message || 'Server error during KYC submission' });
  }
};

export const getPendingKyc = async (_req, res) => {
  try {
    const pendingUsers = await User.find({ kycStatus: 'pending' })
      .select('name email mobile kycStatus kycSubmittedAt kycDocuments')
      .sort({ kycSubmittedAt: -1 });

    res.status(200).json({
      count: pendingUsers.length,
      submissions: pendingUsers.map(formatPendingKyc),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching pending KYC' });
  }
};

export const updateKycStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { userId } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'pending') {
      return res.status(400).json({ message: 'Only pending KYC submissions can be reviewed' });
    }

    if (status === 'approved') {
      user.kycStatus = 'approved';
      user.kycVerified = true;
      user.kycVerifiedAt = new Date();
      user.kycRejectionReason = undefined;
    } else {
      user.kycStatus = 'rejected';
      user.kycVerified = false;
      user.kycVerifiedAt = undefined;
      user.kycRejectionReason = rejectionReason?.trim() || 'Documents could not be verified';
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      message: `KYC ${status} successfully`,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err) => err.message)
        .join(', ');
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: 'Server error while updating KYC status' });
  }
};
