import sanitizeHtml from "sanitize-html";

import Blog from "../models/blog.js";
import cloudinary from "../config/cloudinary.js";

export const createBlog = async (req, res) => {
    try {
        let { title, content } = req.body;
        title = sanitizeHtml(title);
        content = sanitizeHtml(content);
        await Blog.create({
            title,
            content,
            author: req.user._id,
            coverImage: req.file ? req.file.path : undefined,
            coverImagePublicId: req.file ? req.file.filename : null,
        });
        req.flash("success", "Your blog has been published successfully.");
        return res.redirect("/dashboard");
    } catch (error) {
        res.send("Error creating blog");
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name profileImage")
            .sort({ createdAt: -1 });
        return res.render("blog/allBlogs", { blogs });
    } catch (error) {
        res.send("Error fetching blogs");
    }
};

export const getSingleBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate(
            "author",
            "name profileImage",
        );
        return res.render("blog/singleBlog", { blog });
    } catch (error) {
        res.send("Blog not found");
    }
};

export const getUpdateBlog = async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        req.flash("error", "Blog not found.");
        return res.redirect("/dashboard");
    }
    if (blog.author.toString() !== req.user._id.toString()) {
        return res.send("Unauthorized");
    }
    res.render("blog/editBlog", { blog });
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            req.flash("error", "Blog not found.");
            return res.redirect("/dashboard");
        }
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.send("Unauthorized");
        }
        let { title, content } = req.body;
        title = sanitizeHtml(title);
        content = sanitizeHtml(content);
        blog.title = title;
        blog.content = content;
        if (req.file) {
            if (blog.coverImagePublicId) {
                await cloudinary.uploader.destroy(blog.coverImagePublicId);
            }
            blog.coverImage = req.file.path;
            blog.coverImagePublicId = req.file.filename;
        }
        await blog.save();
        req.flash("success", "Your blog has been updated successfully.");
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error updating blog");
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            req.flash("error", "Blog not found.");
            return res.redirect("/dashboard");
        }
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.send("Unauthorized");
        }
        if (blog.coverImagePublicId) {
            await cloudinary.uploader.destroy(blog.coverImagePublicId);
        }
        await Blog.findByIdAndDelete(req.params.id);
        req.flash("success", "Your blog has been deleted successfully.");
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error deleting blog");
    }
};
