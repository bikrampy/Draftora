import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import { sendOtpMail } from "../config/sendMail.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash("error", "An account with this email already exists.");
            return res.redirect("/signup");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: req.file ? req.file.path : undefined,
            profileImagePublicId: req.file ? req.file.filename : null,
        });
        req.flash("success", "Your account has been created successfully.");
        return res.redirect("/login");
    } catch (error) {
        res.send("Signup error");
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash("error", "Invalid email or password.");
            return res.redirect("/login");
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
        });
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Login error");
    }
};

export const logout = (req, res) => {
    res.clearCookie("token");
    req.flash("error", "You have been logged out successfully.");
    return res.redirect("/login");
};

export const sendForgotOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account found with this email address.");
            return res.redirect("/forgot-password");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
        user.otpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        req.flash("success", "A verification OTP has been sent to your email.");
        return res.redirect("/verify-otp?email=" + email);
    } catch (error) {
        res.send("Something went wrong");
    }
};

export const verifyForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account found with this email address.");
            return res.redirect("/forgot-password");
        }
        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.send("The OTP you entered is invalid.");
        }
        if (user.resetOtpExpiry < Date.now()) {
            return res.send("The OTP has expired. Please request a new one.");
        }
        user.otpVerified = true;
        await user.save();
        req.flash(
            "success",
            "OTP verified successfully. You can now reset your password.",
        );
        res.redirect("/reset-password?email=" + email);
    } catch (error) {
        res.send("Something went wrong");
    }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account found with this email address.");
            return res.redirect("/forgot-password");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
        user.otpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        req.flash("success", "A new OTP has been sent to your email.");
        return res.redirect("/verify-otp?email=" + email);
    } catch (error) {
        res.send("Something went wrong");
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.otpVerified) {
            return res.redirect("/forgot-password");
        }
        if (password !== confirmPassword) {
            return res.send("Passwords do not match.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        user.otpVerified = false;
        await user.save();
        req.flash("success", "Your password has been reset successfully.");
        res.redirect("/login");
    } catch (error) {
        res.send("Something went wrong");
    }
};
