import resend from "./resend.js";

export const sendOtpMail = async (email, otp) => {
    try {
        const response = await resend.emails.send({
            from: "Draftora <onboarding@resend.dev>",
            to: email,
            subject: "Draftora Password Reset OTP",

            html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h2>Password Reset Request</h2>

          <p>Your OTP is:</p>

          <h1 style="letter-spacing:5px;">
            ${otp}
          </h1>

          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
        });

        console.log("Email sent:", response);
    } catch (error) {
        console.log("RESEND ERROR:", error);

        throw error;
    }
};
