import express from "express";

import { getDashboard, updateProfile } from "../controllers/user.js";

import { protect } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboard);
router.get("/profile/update", protect, (req, res) => {
    res.render("dashboard/editProfile", { user: req.user });
});
router.post(
    "/profile/update",
    protect,
    upload.single("profileImage"),
    updateProfile,
);

export default router;
