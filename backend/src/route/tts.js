// routes/ttsRoutes.js

const express = require("express");
const fetch = require("node-fetch");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "IKne3meq5aSn9XLyUdCD";

const API_KEY = process.env.ELEVENLABS_API_KEY;

// reusable module/function inside routes file
const generateSpeech = async (text) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("text is required");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs error:", err);
    throw new Error("TTS service error");
  }

  return response;
};

router.post("/tts", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    const upstream = await generateSpeech(text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    upstream.body.pipe(res);
  } catch (err) {
    console.error("TTS route error:", err);

    if (err.message === "text is required") {
      return res.status(400).json({ message: err.message });
    }

    if (err.message === "TTS service error") {
      return res.status(502).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;