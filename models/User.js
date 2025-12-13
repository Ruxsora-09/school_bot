import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  name: String,
  username: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
  votedFor: { type: String, default: null }
});

const User = mongoose.model("User", userSchema);
export default User;
