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

    const API_KEY = process.env.TYPECAST_API_KEY;
    const VOICE_ID = process.env.TYPECAST_VOICE_ID;

    console.log(
      "TYPECAST_API_KEY:",
      API_KEY ? "loaded ✅" : "MISSING ❌"
    );

    console.log("TYPECAST_VOICE_ID:", VOICE_ID);

    if (!API_KEY) {
      return res.status(500).json({
        message: "Missing Typecast API key",
      });
    }

    if (!VOICE_ID) {
      return res.status(500).json({
        message: "Missing Typecast Voice ID",
      });
    }

    // Typecast TTS request
    const upstream = await fetch(
      "https://typecast.ai/api/speak",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_KEY,
        },
        body: JSON.stringify({
          text: text.trim(),
          actor_id: VOICE_ID,
          format: "mp3",
        }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();

      console.error("Typecast API Error:", errText);

      return res.status(502).json({
        message: "TTS service error",
        details: errText,
      });
    }

    const audioBuffer = Buffer.from(
      await upstream.arrayBuffer()
    );

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