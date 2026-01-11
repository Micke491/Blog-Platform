import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { emailService } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // For security, always return the same message whether user exists or not
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (never store plain tokens)
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiration to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    // Create reset URL with the unhashed token (this goes in the email)
    const resetURL = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

    // Send email
    const emailSent = await emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: emailService.generatePasswordResetEmail(resetURL, user.username),
    });

    if (!emailSent) {
      console.error('Failed to send password reset email');
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log(`Password reset email sent to: ${user.email}`);

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}