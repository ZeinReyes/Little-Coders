import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Use createRequire to import JSON files in ESM
const require   = createRequire(import.meta.url);
const weights   = require('./weights.json');
const aiData    = require('./ai_data.json');
const metadata  = require('./metadata.json');

import AiModel from '../model/AiModel.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await AiModel.findOneAndUpdate(
      { type: 'weights' },
      { type: 'weights', data: weights },
      { upsert: true, new: true }
    );
    console.log('✅ weights.json seeded');

    await AiModel.findOneAndUpdate(
      { type: 'ai_data' },
      { type: 'ai_data', data: aiData },
      { upsert: true, new: true }
    );
    console.log('✅ ai_data.json seeded');

    await AiModel.findOneAndUpdate(
      { type: 'metadata' },
      { type: 'metadata', data: metadata },
      { upsert: true, new: true }
    );
    console.log('✅ metadata.json seeded');

    console.log('\n🎉 All AI model data stored in MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();