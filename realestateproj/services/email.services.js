// utils/email.js
const nodemailer = require("nodemailer");

async function sendOTP(otp, to) {
    let subject = "OTP to set password";
    try {
        await sendEmail({
            to,
            subject,
            text: otp,
            html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">OTP Verification</h2>
                    <p>
                        Use the following One-Time Password (OTP) to set your password. This OTP is
                        valid for the next <strong>1 hour</strong>.
                    </p>
                    <div style="background: #f3f4f6; padding: 12px 20px; border-radius: 8px; display: inline-block; margin: 10px 0;">
                        <span style="font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #222;">
                            ${otp}
                        </span>
                    </div>
                    <p>If you did not request this, please ignore this email.</p>
                    <p style="font-size: 12px; color: #888;">— Homesy App —</p>
                </div>`,
        });
    } catch (err) {
        console.error("❌ Email error:", err);
        return err;
    }
}

const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // your Gmail address
            pass: process.env.EMAIL_PASS, // your Gmail app password (not your normal password)
        },
    });

    // 2. Define email options
    const mailOptions = {
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    // 3. Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
};

module.exports = { sendEmail, sendOTP };
