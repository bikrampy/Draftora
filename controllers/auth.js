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
            return res.send("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: req.file ? req.file.path : undefined,
            profileImagePublicId: req.file ? req.file.filename : null,
        });
        res.redirect("/login");
    } catch (error) {
        res.send("Signup error");
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.send("Invalid credentials");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Invalid credentials");
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.cookie("token", token, {
            httpOnly: true,
        });
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Login error");
    }
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
};

export const sendForgotOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.send("No account found");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
        user.otpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        res.redirect("/verify-otp?email=" + email);
    } catch (error) {
        res.send("Something went wrong");
    }
};

export const verifyForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.send("Invalid request");
        }
        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.send("Invalid OTP");
        }
        if (user.resetOtpExpiry < Date.now()) {
            return res.send("OTP expired");
        }
        user.otpVerified = true;
        await user.save();
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
            res.send("No account found");
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
        user.otpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        res.redirect("/verify-otp?email=" + email);
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
            return res.send("Passwords do not match");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        user.otpVerified = false;
        await user.save();
        res.redirect("/login");
    } catch (error) {
        res.send("Something went wrong");
    }
};
