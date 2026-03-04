import AiModel from '../model/AiModel.js';

// In-memory cache so DB isn't hit on every prediction
let cache = {
  weights:  null,
  ai_data:  null,
  metadata: null,
};

export const getAiModelData = async (type) => {
  if (cache[type]) return cache[type];

  const doc = await AiModel.findOne({ type });
  if (!doc) throw new Error(`AI model data not found for type: ${type}`);

  cache[type] = doc.data;
  return cache[type];
};

export const clearAiModelCache = () => {
  cache = { weights: null, ai_data: null, metadata: null };
  console.log('🔄 AI model cache cleared');
};

// Save new training data back to MongoDB after retraining
export const updateAiModelData = async (type, newData) => {
  await AiModel.findOneAndUpdate(
    { type },
    { type, data: newData },
    { upsert: true, new: true }
  );
  clearAiModelCache();
  console.log(`✅ ${type} updated in MongoDB`);
};