const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #007bff; text-align: center;">Zemex Service - Password Reset OTP</h2>
                <p style="font-size: 16px; text-align: justify;">Dear User,</p>
                <p style="font-size: 16px; text-align: justify;">Your OTP for password reset is: <strong>${otp}</strong></p>
                <p style="font-size: 16px; text-align: justify;">Please use this OTP to reset your password. If you didn't request this, please ignore this email.</p>
                <hr style="border: 1px solid #ddd; margin: 15px 0;">
                <p style="font-size: 16px; text-align: justify;">Thank you for choosing Zemex Service.</p>
                <p style="font-size: 16px; text-align: justify;">Best Regards,<br/>Zemex Service Team</p>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
}


function generateOTP() {
    const OTP_LENGTH = 6;
    const min = Math.pow(10, OTP_LENGTH - 1);
    const max = Math.pow(10, OTP_LENGTH) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString().padStart(OTP_LENGTH, '0');
}



module.exports = { sendOTPEmail, generateOTP };