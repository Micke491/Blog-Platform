import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import jwt from "jsonwebtoken";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const { content } = await req.json();
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ message: "Comment cannot be empty" }, { status: 400 });
    }

    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const comment = await Comment.create({
      content,
      author: userId,
      post: params.id
    });

    post.comments.push(comment._id);
    await post.save();

    await comment.populate('author', 'username');

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating comment" }, { status: 500 });
  }
}