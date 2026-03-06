import mongoose from "mongoose";

const lessonActivitySchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonMaterial",
      required: true,
    },

    name: { type: String, required: true },
    instructions: { type: String, required: true },
    hints: { type: [String], default: [] },
    expectedOutput: { type: String, default: "" },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    timeLimit: {
      type: Number,
      required: true,
      min: 10,
    },

    order: { type: Number, default: 0 },

    // ✅ Changed from [String] to [{ type, min }] to support minimum counts per block type
    dataTypesRequired: {
      type: [
        {
          type: {
            type: String,
            enum: [
              "print", "variable", "multiple", "add", "subtract", "divide",
              "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
              "if", "elif", "else", "while",
            ],
            required: true,
          },
          min: {
            type: Number,
            default: 1,
            min: 1,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("LessonActivity", lessonActivitySchema);