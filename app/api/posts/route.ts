import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const authorUsername = searchParams.get("author");
    const includePrivate = searchParams.get("includePrivate") === "true";

    let query: any = {};
    if (authorUsername) {
      // First find the user by username
      const User = (await import("@/models/User")).default;
      const user = await User.findOne({ username: authorUsername });
      if (user) {
        query.author = user._id;
        // If viewing own profile, include private posts
        if (includePrivate) {
          // Don't filter by published
        } else {
          query.published = true;
        }
      } else {
        return NextResponse.json({ posts: [] }, { status: 200 });
      }
    } else {
      // For explore page, only show published posts
      query.published = true;
    }

    const posts = await Post.find(query)
      .populate("author", "username bio avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Error fetching posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { title, content, coverImage, tags, published } =
      await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    const newPost = new Post({
      title,
      content,
      coverImage,
      tags: tags || [],
      published: published !== undefined ? published : true,
      author: user.id,
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "username"
    );

    return NextResponse.json({ post: populatedPost }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Error creating post" },
      { status: 500 }
    );
  }
}
