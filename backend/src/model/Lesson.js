import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  topic: {
    type: String,
    enum: ["variables", "operators", "conditionals", "loops", "functions"],
    required: true,
  },
});

export default mongoose.model("Lesson", LessonSchema);