import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import jwt from "jsonwebtoken";

// GET: Fetch a single post
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const post = await Post.findById(id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching post" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    // 1. Verify Authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let userId;
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userId = decoded.userId || decoded.id;
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // 2. Find Post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // 3. Check Ownership
    if (post.author.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden - You can only edit your own posts" }, { status: 403 });
    }

    // 4. Update Fields
    const body = await req.json();
    const { title, content, tags } = body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;

    await post.save();

    // 5. Return updated post (populated so UI stays consistent)
    const updatedPost = await Post.findById(id).populate('author', 'username avatar');

    return NextResponse.json({ post: updatedPost, message: "Post updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ message: "Error updating post" }, { status: 500 });
  }
}

// DELETE: Remove a post
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

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

    if (post.author.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: id });

    // Delete the post
    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting post" }, { status: 500 });
  }
}