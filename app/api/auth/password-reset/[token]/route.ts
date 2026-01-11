import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ token: string }> } 
) {
  try {
    await connectDB();

    // 👈 Await the params to get the token string safely
    const params = await props.params;
    const { token } = params;

    // 1. Recreate the hash from the URL token
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Debugging Logs (Check your server terminal when you click the link)
    console.log("--- DEBUG VERIFY ---");
    console.log("Token from URL:", token);
    console.log("Hashed Token:", resetTokenHash);
    
    // 3. Find user
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log("❌ Result: No matching user found (or token expired)");
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    console.log("✅ Result: User found:", user.email);
    return NextResponse.json({ valid: true, email: user.email });

  } catch (error) {
    console.error('Verify Token Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ token: string }> } // 👈 Type as Promise
) {
  try {
    await connectDB();

    const params = await props.params;
    const { token } = params;
    
    const body = await req.json();
    const { newPassword } = body;

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear the reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return NextResponse.json({ message: 'Password reset successful' });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}