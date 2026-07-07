import express from 'express';
import {registerUser, loginUser, forgetPassword, resetPassword, googleLogin} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post("/register",registerUser);
router.get("/profile",protect ,(req,res) => {
    res.status(200).json(req.user);
})
router.post("/login",loginUser);
router.post("/google", googleLogin);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);


export default router;