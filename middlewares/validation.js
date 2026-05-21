import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send(errors.array()[0].msg);
    }
    next();
};

export const validateSignup = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

export const validateLogin = [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
];

export const validateBlog = [
    body("title").trim().notEmpty().withMessage("Blog title required"),
    body("content").trim().notEmpty().withMessage("Blog content required"),
];
