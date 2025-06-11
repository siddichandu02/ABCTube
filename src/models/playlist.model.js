import mangoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", // reference to the Video model
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to the User model
    },
  },
  { timestamps: true }
);

export const Playlist = mangoose.model("Playlist", playlistSchema);
// This code defines a Mongoose schema for a playlist model in a video streaming application.
