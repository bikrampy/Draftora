import Blog from "../models/blog.js";
import cloudinary from "../config/cloudinary.js";
export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;
        await Blog.create({
            title,
            content,
            author: req.user._id,
            coverImage: req.file ? req.file.path : undefined,
            coverImagePublicId: req.file ? req.file.filename : null,
        });
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error creating blog");
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name profileImage")
            .sort({ createdAt: -1 });
        res.render("blog/allBlogs", { blogs });
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
        res.render("blog/singleBlog", { blog });
    } catch (error) {
        res.send("Blog not found");
    }
};

export const getUpdateBlog = async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (blog.author.toString() !== req.user._id.toString()) {
        return res.send("Unauthorized");
    }
    res.render("blog/editBlog", { blog });
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.send("Blog not found");
        }
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.send("Unauthorized");
        }
        const { title, content } = req.body;
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
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error updating blog");
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.send("Unauthorized");
        }
        if (blog.coverImagePublicId) {
            await cloudinary.uploader.destroy(blog.coverImagePublicId);
        }
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect("/dashboard");
    } catch (error) {
        res.send("Error deleting blog");
    }
};
