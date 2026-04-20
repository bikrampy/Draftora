import express from "express";
import {
    signup,
    login,
    logout,
    showForgotPasswordPage,
    sendForgotOtp,
    showVerifyOtpPage,
    verifyForgotOtp,
    resendForgotOtp,
    showResetPasswordPage,
    resetPassword,
} from "../controllers/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/signup", (req, res) => res.render("auth/signup"));
router.get("/login", (req, res) => res.render("auth/login"));
router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/forgot-password", showForgotPasswordPage);
router.post("/forgot-password", sendForgotOtp);
router.get("/verify-otp", showVerifyOtpPage);
router.post("/verify-otp", verifyForgotOtp);
router.post("/resend-otp", resendForgotOtp);
router.get("/reset-password", showResetPasswordPage);
router.post("/reset-password", resetPassword);

export default router;
