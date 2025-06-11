import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video", // reference to the Video model
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment", // reference to the Comment model
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet", // reference to the Tweet model
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to the User model
    },
  },
  { timestamps: true }
);
likeSchema.plugin(mongooseAggregatePaginate);
// This code defines a Mongoose schema for a like model in a video streaming application.
export const Like = mongoose.model("Like", likeSchema);
