import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Provera tokena
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId || decoded.id;

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Convert userId to ObjectId for proper comparison
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    
    // Toggle like - check if user already liked
    const likeIndex = post.likes.findIndex(
      (likeId) => likeId.toString() === userIdObjectId.toString()
    );
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1); // Unlike
    } else {
      post.likes.push(userIdObjectId); // Like
    }

    await post.save();
    return NextResponse.json({ 
      likes: post.likes.length,
      liked: likeIndex === -1 // true if we just liked, false if we just unliked
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing like:", error);
    return NextResponse.json({ message: "Error processing like" }, { status: 500 });
  }
}