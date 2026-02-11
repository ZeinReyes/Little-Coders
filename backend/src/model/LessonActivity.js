import mongoose from "mongoose";

const lessonActivitySchema = new mongoose.Schema(
  {
    materialId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "LessonMaterial", 
      required: true 
    },

    name: { type: String, required: true },
    instructions: { type: String, required: true },
    hints: { type: [String], default: [] },
    expectedOutput: { type: String, default: "" },

    difficulty: { 
      type: String, 
      enum: ["easy", "medium", "hard"], 
      default: "easy" 
    },

    // ✅ NEW FIELD
    timeLimit: {
      type: Number,
      required: true,
      min: 10, // minimum 10 seconds
    },

    order: { type: Number, default: 0 },

    dataTypesRequired: {
      type: [String],
      enum: [
        "print", "variable", "multiple", "add", "subtract", "divide",
        "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
        "if", "elif", "else", "while"
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("LessonActivity", lessonActivitySchema);
