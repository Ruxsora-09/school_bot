import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: Number,
      required: true,
      unique: true,
    },

    username: String,
    firstName: String,
    lastName: String,

    votedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
