import express from "express";

import {
    signup,
    login,
    logout,
    sendForgotOtp,
    verifyForgotOtp,
    resendOtp,
    resetPassword,
} from "../controllers/auth.js";
import User from "../models/user.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/signup", (req, res) => res.render("auth/signup"));
router.get("/login", (req, res) => res.render("auth/login"));

router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", login);

router.get("/logout", logout);

router.get("/forgot-password", (req, res) => res.render("auth/forgotPassword"));
router.post("/forgot-password", sendForgotOtp);

router.get("/verify-otp", (req, res) => {
    const { email } = req.query;
    res.render("auth/verifyOtp", { email });
});
router.post("/verify-otp", verifyForgotOtp);

router.post("/resend-otp", resendOtp);

router.get("/reset-password", async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user || !user.otpVerified) {
        return res.redirect("/forgot-password");
    }
    res.render("auth/resetPassword", { email });
});
router.post("/reset-password", resetPassword);

export default router;
