import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOtpMail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"Draftora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Draftora Password Reset OTP",
            html: `
          <h2>Password Reset Request</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        `,
        });
    } catch (error) {
        console.log("MAIL ERROR:", error);
        throw error;
    }
};
