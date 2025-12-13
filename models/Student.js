import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  votes: { type: Number, default: 0 }
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
