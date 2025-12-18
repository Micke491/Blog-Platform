import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  tags: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  published: boolean;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    published: {
      type: Boolean,
      default: true,
    },
    coverImage: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexi
PostSchema.index({ title: "text", content: "text" });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
