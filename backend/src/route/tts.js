import express from "express";
import fetch from "node-fetch";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/tts", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "text is required",
      });
    }

    // Environment variables
    const VOICE_ID =
      process.env.ELEVENLABS_VOICE_ID ||
      "IKne3meq5aSn9XLyUdCD";

    const API_KEY = process.env.ELEVENLABS_API_KEY;

    // Debug logs
    console.log("VOICE_ID:", VOICE_ID);

    console.log(
      "ELEVENLABS_API_KEY:",
      API_KEY ? "loaded ✅" : "MISSING ❌"
    );

    // Prevent request if API key missing
    if (!API_KEY) {
      return res.status(500).json({
        message: "Missing ElevenLabs API key",
      });
    }

    // Request to ElevenLabs
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),

          // More stable model
          model_id: "eleven_multilingual_v2",

          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    // Handle ElevenLabs errors
    if (!upstream.ok) {
      const errText = await upstream.text();

      console.error(
        "ElevenLabs API Error:",
        errText
      );

      return res.status(502).json({
        message: "TTS service error",
        details: errText,
      });
    }

    // Convert audio stream to buffer
    const audioBuffer = Buffer.from(
      await upstream.arrayBuffer()
    );

    // Send audio back
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    return res.send(audioBuffer);
  } catch (err) {
    console.error("TTS Route Error:", err);

    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

export default router;