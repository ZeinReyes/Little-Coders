import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['weights', 'ai_data', 'metadata'],
      required: true,
      unique: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('AiModel', aiModelSchema);