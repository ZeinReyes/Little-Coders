import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
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
        dataTypesRequired: {
          type: [String],
          enum: [
            "print", "variable", "multiple", "add", "subtract", "divide",
            "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
            "if", "elif", "else", "while",
          ],
          default: [],
          
        },
      },
    ],
    order: { type: Number, default: 0 },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ✅ Format JSON response
assessmentSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Assessment", assessmentSchema);
