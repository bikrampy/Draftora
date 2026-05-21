import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import session from "express-session";
import flash from "connect-flash";

import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blog.js";
import userRoutes from "./routes/user.js";

import { checkAuth } from "./middlewares/auth.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";

import { connectDB } from "./config/db.js";
connectDB();

const app = express();

const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.tailwindcss.com",
                ],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
            },
        },
    }),
);
app.use(globalLimiter);
app.use(
    session({
        secret: process.env.DRAFTORA_SECRET,
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(checkAuth);
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", authRoutes);
app.use("/", blogRoutes);
app.use("/", userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
