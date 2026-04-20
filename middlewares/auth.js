import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect("/login");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.redirect("/login");
        req.user = user;
        next();
    } catch (error) {
        return res.redirect("/login");
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            req.user = null;
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};
