import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  topic: {
    type: String,
    enum: ["variables", "operators", "conditionals", "loops", "overview"],
    required: true,
  },

  // ✅ Optional: Add relationship to assessments (if you want to populate later)
  assessments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment", // must match the model name in assessmentModel.js
    },
  ],
}, 
{ timestamps: true });

export default mongoose.model("Lesson", LessonSchema);
