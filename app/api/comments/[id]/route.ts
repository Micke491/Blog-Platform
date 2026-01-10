import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import jwt from "jsonwebtoken";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId || decoded.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.author.toString() !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Comment.findByIdAndDelete(id);

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: id },
    });

    return NextResponse.json({ message: "Comment deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting comment" },
      { status: 500 }
    );
  }
}
