import express from "express";
import fetch from "node-fetch";
import { verifyToken } from "../middleware/auth.js"; // adjust path if different

const router = express.Router();

router.post("/tts", verifyToken, async (req, res) => {
  console.log("VOICE_ID:", process.env.ELEVENLABS_VOICE_ID);
  console.log("API_KEY:", process.env.ELEVENLABS_API_KEY ? "loaded ✅" : "MISSING ❌");
  const { text } = req.body;
  if (!text || typeof text !== "string" || !text.trim())
    return res.status(400).json({ message: "text is required" });

  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "IKne3meq5aSn9XLyUdCD";
  const API_KEY  = process.env.ELEVENLABS_API_KEY;

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method:  "POST",
        headers: {
          "xi-api-key":   API_KEY,
          "Content-Type": "application/json",
          "Accept":       "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability:         0.75,
            similarity_boost:  0.85,
            style:             0.40,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!upstream.ok) {
      const err = await upstream.text();
      console.error("ElevenLabs error:", err);
      return res.status(502).json({ message: "TTS service error" });
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    upstream.body.pipe(res);
  } catch (err) {
    console.error("TTS route error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;