import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ message: "Error fetching posts" }, { status: 500 });
  }
}