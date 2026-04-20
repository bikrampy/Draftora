import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blog.js";
import userRoutes from "./routes/user.js";
import { checkAuth } from "./middlewares/auth.js";

import { connectDB } from "./config/db.js";
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(checkAuth);
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", authRoutes);
app.use("/", blogRoutes);
app.use("/", userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
