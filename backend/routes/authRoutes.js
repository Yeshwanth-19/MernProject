import express from 'express';
import {registerUser, loginUser, forgetPassword, resetPassword, googleLogin} from '../controllers/authController.js';
import { submitKyc, getPendingKyc, updateKycStatus } from '../controllers/kycController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadKycDocuments } from '../middleware/uploadMiddleware.js';


const router = express.Router();

router.post("/register",registerUser);
router.get("/profile",protect ,(req,res) => {
    res.status(200).json(req.user);
})
router.post("/login",loginUser);
router.post("/google", googleLogin);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post(
  "/kyc",
  protect,
  (req, res, next) => {
    uploadKycDocuments(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message || 'Failed to upload KYC documents',
        });
      }
      next();
    });
  },
  submitKyc
);
router.get("/kyc/pending", protect, adminOnly, getPendingKyc);
router.patch("/kyc/:userId/status", protect, adminOnly, updateKycStatus);


export default router;