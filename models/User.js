import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  telegramId: Number,
  votedFor: { type: String, default: null }
});

const User = mongoose.model("User", userSchema);
export default User;
