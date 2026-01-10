import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { bio, avatar } = await request.json();

    await connectDB();

    const updateData: any = {};
    if (bio !== undefined) {
      updateData.bio = bio.trim() || null;
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar || null;
    }

    const user = await User.findByIdAndUpdate(decoded.userId, updateData, {
      new: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
