import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topics: {
    variables: { type: Boolean, default: false },
    operators: { type: Boolean, default: false },
    conditionals: { type: Boolean, default: false },
    loops: { type: Boolean, default: false },
    functions: { type: Boolean, default: false },
  },
});

export default mongoose.model("Lesson", lessonSchema);
