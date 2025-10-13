// model/Assessment.js
import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    // 🧩 Basic info
    title: { type: String, required: true, trim: true },
    question: { type: String, required: true },
    instructions: { type: String, required: true },
    hints: { type: [String], default: [] },

    // ✅ Data type or operator checks (no regex)
    dataTypeChecks: [
      {
        name: { type: String, required: true }, // e.g. "print", "for", "+"
        required: { type: Boolean, default: false },
      },
    ],

    // ✅ Expected output (optional)
    expectedOutput: { type: String, trim: true, default: "" },

    // 🧠 Metadata
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    category: {
      type: String,
      trim: true,
      default: "Logic and Control Flow",
    },

    // 🧩 Lesson linkage
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ✅ Default data type/operator list
assessmentSchema.pre("save", function (next) {
  if (!this.dataTypeChecks || this.dataTypeChecks.length === 0) {
    this.dataTypeChecks = [
      { name: "print", required: false },
      { name: "variable", required: false },
      { name: "if", required: false },
      { name: "elif", required: false },
      { name: "else", required: false },
      { name: "for", required: false },
      { name: "while", required: false },
      { name: "+", required: false },
      { name: "-", required: false },
      { name: "*", required: false },
      { name: "/", required: false },
      { name: "==", required: false },
      { name: "!=", required: false },
      { name: "<", required: false },
      { name: "<=", required: false },
      { name: ">", required: false },
      { name: ">=", required: false },
    ];
  }
  next();
});

// ✅ Clean output
assessmentSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Assessment", assessmentSchema);
