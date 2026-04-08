# 🧒 LittleCoders AI

An adaptive coding education platform for children — powered by a custom-trained neural network and AI-generated review sessions.

---

## 📖 Overview

LittleCoders AI is a full-stack MERN web application where parents register and create profiles for their children. Kids log in through their profile and work through structured coding modules at their own pace. The platform adapts quiz difficulty in real time using a custom-trained neural network, and provides AI-generated review sessions when a student struggles.

---

## ✨ Features

- **Parent & Child Profiles** — Parents register and manage child accounts. Children select their profile to enter the platform.
- **Sequential Modules** — Lessons are locked in order; a module must be completed before the next unlocks.
- **Lesson Materials & Activities** — Each module includes reading material and optional hands-on activities.
- **5-Question Assessments** — Each module ends with a quiz to test understanding.
- **AI Review Sessions (OpenRouter)** — After 2 wrong answers on any activity or assessment question, students are prompted to take an AI-generated review session that produces custom lesson material, an activity, and a mini-assessment.
- **Adaptive Difficulty Engine** — A custom neural network adjusts question difficulty (Easy → Medium → Hard) in real time based on each student's performance during assessments.
- **Continuous Learning** — The AI model retrains itself after every 10 real student sessions, improving over time.
- **Failure Handling** — After 3 wrong attempts, the student sees an explanation of why they failed and can choose to retry the AI review or return to the module.

---

## 🧠 Adaptive Difficulty Neural Network

The custom AI (`LittleCodersAI`) is a 3-layer feedforward neural network that predicts the best next difficulty level (Easy, Medium, Hard) based on a student's recent performance.

### How It Works

| Step | Description |
|------|-------------|
| First startup | Trains on 59 bootstrap examples, saves weights to disk |
| Every restart | Loads saved weights instantly — no retraining needed |
| After each assessment | Session is recorded to `ai_data.json` |
| Every 10 sessions | Retrains on bootstrap + all real student data |
| New weights saved | Next restart is still instant |

### Input Features (8)

1. Average attempts on last 3 questions (normalised)
2. Solve rate on last 3 questions
3. Average hints used (normalised)
4. Current difficulty level (Easy=0, Medium=0.5, Hard=1)
5. First-attempt solve rate
6. Overall failure rate
7. Current correct-answer streak (normalised over 3)
8. Questions remaining (normalised over 5)

### Safety Guardrails

- **One-step clamp** — Difficulty can only move one level at a time (e.g. Easy → Medium, not Easy → Hard)
- **Confidence threshold** — The model requires ≥60% confidence before changing difficulty
- **Persistence** — Weights, metadata, and student session data are stored in `/ai_model/`

---

## 🗂️ Project Structure

```
littlecoders/
├── frontend/                  # React frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       └── ...
├── backend/                  # Express backend
│   ├── controllers/
│   │   └── aiDifficultyController.js
│   ├── services/
│   │   └── LittleCodersAI.js   # Neural network engine
│   ├── model/
│   │   └── AiModel.js          # MongoDB model for AI weights
│   └── routes/
├── ai_model/                # Persisted AI files (auto-generated)
│   ├── weights.json
│   ├── metadata.json
│   └── ai_data.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- An [OpenRouter](https://openrouter.ai) API key (for AI review sessions)

### Installation

```bash
# Clone the repo
git clone https://github.com/ZeinReyes/Little-Coders.git
cd littlecoders-ai

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
JWT_SECRET=your_jwt_secret
```

### Running the App

```bash
# Start the backend
cd server
npm start

# Start the frontend (in a separate terminal)
cd client
npm start
```

The first time the server starts, the AI will automatically train on bootstrap data and save its weights. All subsequent restarts will load the weights instantly.

---

## 🔌 AI API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/suggest-difficulty` | Returns next suggested difficulty based on student history |
| `POST` | `/api/ai/record-session` | Saves a completed assessment session for future retraining |
| `GET` | `/api/ai/status` | Returns model version, accuracy, sample counts, and retrain schedule |

### Example: Suggest Difficulty

```json
POST /api/ai/suggest-difficulty
{
  "history": [
    { "solved": true, "attemptsUsed": 1, "hintsUsed": 0, "difficulty": "Easy" },
    { "solved": true, "attemptsUsed": 2, "hintsUsed": 1, "difficulty": "Easy" }
  ],
  "currentDifficulty": "Easy",
  "questionsRemaining": 3
}
```

```json
{
  "success": true,
  "suggestedDifficulty": "Medium",
  "confidence": "high",
  "reasoning": "AI v2 (45 real samples): Solving Easy consistently — time for Medium!"
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| AI Difficulty Engine | Custom Neural Network (vanilla JS) |
| AI Review Sessions | OpenRouter API |
| State | In-memory cache + MongoDB persistence |

---

## 📈 Model Retraining

The model improves automatically as more students use the platform:

1. Every completed assessment is saved as labeled training samples.
2. After 10 new sessions, the model retrains in the background using `setImmediate()` — no downtime.
3. The retrained weights are saved and loaded on next restart.
4. Model version, accuracy, and sample counts are tracked in `metadata.json`.
