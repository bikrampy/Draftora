import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
            default: "/uploads/profileDefault.jpg",
        },
        resetOtp: { type: String },
        resetOtpExpiry: { type: Date },
        otpVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.model("User", userSchema);
