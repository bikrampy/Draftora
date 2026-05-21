import Blog from "../models/blog.js";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
export const getDashboard = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id }).sort({
            createdAt: -1,
        });
        res.render("dashboard/index", {
            user: req.user,
            blogs,
        });
    } catch (error) {
        res.send("Dashboard error");
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);
        user.name = name;
        user.email = email;
        if (req.file) {
            if (user.profileImagePublicId) {
                await cloudinary.uploader.destroy(user.profileImagePublicId);
            }
            user.profileImage = req.file.path;
            user.profileImagePublicId = req.file.filename;
        }
        await user.save();
        req.flash("success", "Your profile was updated successfully.");
        return res.redirect("/dashboard");
    } catch (error) {
        res.send("Profile update error");
    }
};
