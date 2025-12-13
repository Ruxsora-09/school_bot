import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  class: String,
  photo: String,
  achievements: [String],
  votes: { type: Number, default: 0 }
});

export default mongoose.model("Student", studentSchema);
