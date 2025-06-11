import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video", // reference to the Video model
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to the User model
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);
// This code defines a Mongoose schema for a comment model in a video streaming application.
export const Comment = mongoose.model("Comment", commentSchema);
