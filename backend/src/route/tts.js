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
    const API_KEY = process.env.FISH_AUDIO_API_KEY;
    const VOICE_ID = process.env.FISH_AUDIO_VOICE_ID;

    // Debug logs
    console.log(
      "FISH_AUDIO_API_KEY:",
      API_KEY ? "loaded ✅" : "MISSING ❌"
    );

    console.log("FISH_AUDIO_VOICE_ID:", VOICE_ID);

    // Prevent request if API key missing
    if (!API_KEY) {
      return res.status(500).json({
        message: "Missing Fish Audio API key",
      });
    }

    // Prevent request if voice id missing
    if (!VOICE_ID) {
      return res.status(500).json({
        message: "Missing Fish Audio Voice ID",
      });
    }

    // Request to Fish Audio
    const upstream = await fetch(
      "https://api.fish.audio/v1/tts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },

        body: JSON.stringify({
          text: text.trim(),

          // Your cloned/custom voice
          voice_id: VOICE_ID,

          // Optional settings
          format: "mp3",
          speed: 1,
        }),
      }
    );

    // Handle Fish Audio errors
    if (!upstream.ok) {
      const errText = await upstream.text();

      console.error(
        "Fish Audio API Error:",
        errText
      );

      return res.status(502).json({
        message: "TTS service error",
        details: errText,
      });
    }

    // Convert audio response to buffer
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