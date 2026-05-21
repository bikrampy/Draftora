import express from "express";

import {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog,
    getUpdateBlog,
} from "../controllers/blog.js";

import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import {
    validateBlog,
    handleValidationErrors,
} from "../middlewares/validation.js";

const router = express.Router();

router.get("/", getAllBlogs);

router.get("/blog/create", protect, (req, res) => {
    res.render("blog/createBlog");
});
router.post(
    "/blog/create",
    protect,
    upload.single("coverImage"),
    validateBlog,
    handleValidationErrors,
    createBlog,
);

router.get("/blog/:id", getSingleBlog);

router.get("/blog/edit/:id", protect, getUpdateBlog);
router.post(
    "/blog/edit/:id",
    protect,
    upload.single("coverImage"),
    validateBlog,
    handleValidationErrors,
    updateBlog,
);

router.post("/blog/delete/:id", protect, deleteBlog);

export default router;
