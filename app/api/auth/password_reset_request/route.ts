import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive a password reset email",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Check if email configuration exists
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS
    ) {
      console.error(
        "Email configuration is missing. Please check your .env.local file"
      );

      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive a password reset email",
        },
        { status: 200 }
      );
    }

    try {
      // Configure email transporter
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send email
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
                color: white; 
                text-decoration: none; 
                border-radius: 8px;
                font-weight: bold;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password. Click the button below to proceed:</p>
              <p style="margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this, please ignore this email.</p>
              <div class="footer">
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Password reset email sent successfully to:", email);
    } catch (emailError) {
      console.error("Email sending error:", emailError);

      // Still return success to prevent email enumeration
      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive a password reset email",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account exists, you will receive a password reset email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { message: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
