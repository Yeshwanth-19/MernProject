import express from 'express';
import { kycVerification } from '../controllers/verificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/kyc', protect, adminOnly, kycVerification);

export default router;
