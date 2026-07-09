import User from '../models/User.js';

const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  kycVerified: user.kycVerified,
  kycStatus: user.kycStatus,
  kycVerifiedAt: user.kycVerifiedAt,
  kycSubmittedAt: user.kycSubmittedAt,
  kycRejectionReason: user.kycRejectionReason,
});

export const kycVerification = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    const { status, rejectionReason } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'pending') {
      return res.status(400).json({
        message: 'Only pending KYC submissions can be verified',
        kycStatus: user.kycStatus,
      });
    }

    if (!user.kycDocuments?.aadhaarFront || !user.kycDocuments?.aadhaarBack || !user.kycDocuments?.panCard) {
      return res.status(400).json({ message: 'KYC documents are missing for this user' });
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

    res.status(500).json({ message: 'Server error during KYC verification' });
  }
};
