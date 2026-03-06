import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    // WHOLE ASSESSMENT TIME LIMIT (in seconds)
    timeLimit: {
      type: Number,
      required: true,
      min: 30,
    },

    questions: [
      {
        instructions: { type: String, required: true },
        hints: { type: [String], default: [] },
        expectedOutput: { type: String },
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          default: "Easy",
        },
        // ✅ Changed from [String] to [{ type, min }] to support minimum counts per block type
        dataTypesRequired: {
          type: [
            {
              type: {
                type: String,
                enum: [
                  "print", "variable", "multiple", "add", "subtract", "divide",
                  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
                  "if", "elif", "else", "while", "do-while", "for",  // ← add these three
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
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

assessmentSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Assessment", assessmentSchema);