import UserLessonProgress from "../model/UserLessonProgress.js";
import LessonActivity from "../model/LessonActivity.js";
import Lesson from "../model/Lesson.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "arcee-ai/trinity-mini:free",
  "openrouter/auto",
];

// ─────────────────────────────────────────────
// HELPER: Call OpenRouter with any prompt
// ─────────────────────────────────────────────
const callOpenRouter = async (systemPrompt, userPrompt, maxTokens = 150) => {
  let lastError = null;
  for (const model of FREE_MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://littlecoders.app",
          "X-Title": "Little Coders AI",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt   },
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`⚠️  ${model} failed (${response.status}):`, errText.slice(0, 80));
        lastError = new Error(`${model} → ${response.status}`);
        continue;
      }

      const data = await response.json();
      const raw  = data.choices?.[0]?.message?.content?.trim() || null;
      if (!raw) {
        console.warn(`⚠️  ${model} empty response`);
        lastError = new Error(`${model} → empty`);
        continue;
      }

      console.log(`✅ Got response from: ${model}`);
      return raw;
    } catch (err) {
      console.warn(`⚠️  ${model} threw:`, err.message);
      lastError = err;
    }
  }
  throw new Error(`All models failed. Last: ${lastError?.message}`);
};

// ─────────────────────────────────────────────
// HELPER: Safely parse JSON from AI output
// ─────────────────────────────────────────────
const safeParseJSON = (raw) => {
  const cleaned = raw.replace(/```(?:json)?|```/g, "").trim();
  const match   = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return JSON.parse(match ? match[0] : cleaned);
};

// ─────────────────────────────────────────────
// RULE-BASED: Check if user needs review
// ─────────────────────────────────────────────
export const checkNeedsReview = async (req, res) => {
  try {
    console.log("🔵 [RULE] Checking if review needed");
    const { userId, lessonId, currentFailures, missingTypes } = req.body;

    if (!userId || !lessonId || currentFailures === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedMissingTypes = [];
    if (missingTypes) {
      parsedMissingTypes = typeof missingTypes === "string"
        ? JSON.parse(missingTypes)
        : missingTypes;
    }

    const needsReview = currentFailures >= 2;

    if (!needsReview) {
      return res.status(200).json({
        needsReview: false,
        message: "Keep trying! You can do it! 💪",
      });
    }

    const uniqueMissingTypes = [...new Set(parsedMissingTypes)];
    console.log(`⚠️ User failed ${currentFailures} times, missing types:`, uniqueMissingTypes);

    return res.status(200).json({
      needsReview: true,
      currentFailures,
      missingTypes: uniqueMissingTypes,
      message: `You've tried ${currentFailures} times. Want a quick review? 📚`,
    });

  } catch (err) {
    console.error("🔥 Check review error:", err);
    res.status(500).json({ message: "Failed to check review status", error: err.message });
  }
};

// ─────────────────────────────────────────────
// AI GENERATION: Create review lesson + activity + assessment
// Short, child-friendly content for ages 8-12
// ─────────────────────────────────────────────
export const generateReviewContent = async (req, res) => {
  try {
    console.log("🎓 [AI] Generating review content");
    const { userId, lessonId, missingTypes } = req.body;

    if (!userId || !lessonId || !missingTypes || !missingTypes.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentLesson = await Lesson.findById(lessonId).lean();
    if (!currentLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const blockTypeNames = {
      print:        "Print",
      variable:     "Variables",
      add:          "Addition",
      subtract:     "Subtraction",
      multiply:     "Multiplication",
      divide:       "Division",
      equal:        "Equal (==)",
      notequal:     "Not Equal (!=)",
      less:         "Less Than (<)",
      lessequal:    "Less Than or Equal (<=)",
      greater:      "Greater Than (>)",
      greaterequal: "Greater Than or Equal (>=)",
      if:           "If statements",
      elif:         "Elif statements",
      else:         "Else statements",
      while:        "While loops",
      for:          "For loops",
      "do-while":   "Do-while loops",
    };

    const missingConcepts = missingTypes.map(t => blockTypeNames[t] || t).join(", ");
    console.log(`📚 Generating review for: ${missingConcepts}`);

    // ── Tighter prompt — shorter output, child-friendly language ──
    const systemPrompt =
      "You are a fun coding teacher for kids aged 8-12 on Little Coders, a drag-and-drop Python platform. " +
      "Write SHORT, simple, encouraging content. Use emojis. No big words. No long paragraphs. " +
      "Each explanation must be 1-2 sentences max. Be like a friendly older sibling, not a textbook. " +
      "Respond with ONLY valid JSON. No markdown, no code blocks, no extra text.";

    const userPrompt = `
A student is stuck on "${currentLesson.title}" and struggling with: ${missingConcepts}.

Write a SHORT review lesson for them. Keep it simple and fun.

Return ONLY this JSON (no extra text):
{
  "lessonMaterial": {
    "title": "Short catchy title with emoji (max 6 words)",
    "overview": "One sentence. What we'll learn. Use an emoji.",
    "contents": [
      "One simple sentence explaining the concept with a fun example. Max 2 sentences. Use emojis.",
      "One helpful tip or trick. Max 2 sentences. Use emojis."
    ]
  },
  "activity": {
    "name": "Activity name (max 5 words)",
    "instructions": "One clear sentence telling the student exactly what to do. Use an emoji.",
    "hints": ["Short hint 1", "Short hint 2"],
    "expectedOutput": "exact fixed output string e.g. Hello! or 5",
    "dataTypesRequired": ${JSON.stringify(missingTypes)},
    "difficulty": "easy",
    "timeLimit": 180
  },
  "assessmentQuestions": [
    {
      "instructions": "One sentence. Clear task. Emoji. Matches expectedOutput exactly.",
      "hints": ["Short hint 1"],
      "expectedOutput": "exact fixed output string",
      "dataTypesRequired": ${JSON.stringify(missingTypes.slice(0, 1))},
      "difficulty": "Easy"
    },
    {
      "instructions": "One sentence. Slightly harder task. Emoji. Matches expectedOutput exactly.",
      "hints": ["Short hint 1"],
      "expectedOutput": "exact fixed output string",
      "dataTypesRequired": ${JSON.stringify(missingTypes)},
      "difficulty": "Medium"
    }
  ]
}

RULES:
- contents: exactly 2 strings, max 2 sentences each
- assessmentQuestions: exactly 2 items
- dataTypesRequired: only use these → ${missingTypes.join(", ")}
- expectedOutput: always a fixed literal string, never "your name" or placeholders
- instructions must match expectedOutput exactly
- NO long paragraphs. Keep everything SHORT.`;

    let reviewData;
    try {
      const raw  = await callOpenRouter(systemPrompt, userPrompt, 1200);
      reviewData = safeParseJSON(raw);
      console.log("✅ AI generated review content");
    } catch (err) {
      console.warn("⚠️  AI generation failed, using fallback");

      const primaryType = missingTypes[0];
      const conceptName = blockTypeNames[primaryType] || primaryType;

      // Short, child-friendly fallback
      reviewData = {
        lessonMaterial: {
          title: `Let's Try ${conceptName} Again! 🎯`,
          overview: `Let's figure out ${conceptName.toLowerCase()} together — it's easier than you think! 🌟`,
          contents: [
            `The ${conceptName.toLowerCase()} block tells the computer what to do. Think of it like giving instructions to a robot! 🤖`,
            `Tip: drag the ${primaryType} block onto the whiteboard first, then check the expected output below. You've got this! 💪`,
          ],
        },
        activity: {
          name: `Practice ${conceptName}`,
          instructions: `Use the ${primaryType} block to create the output shown below! 🚀`,
          hints: [
            `Drag the ${primaryType} block onto the whiteboard.`,
            `Check the expected output — your program should match it exactly!`,
          ],
          expectedOutput: primaryType === "print" ? "Hello!" : "5",
          dataTypesRequired: [primaryType],
          difficulty: "easy",
          timeLimit: 180,
        },
        assessmentQuestions: [
          {
            instructions: `Use the ${primaryType} block to make the output below! 🎯`,
            hints: [`Use the ${primaryType} block!`],
            expectedOutput: primaryType === "print" ? "Great job!" : "10",
            dataTypesRequired: [primaryType],
            difficulty: "Easy",
          },
          {
            instructions: `Can you do it again? Make the output below using ${conceptName.toLowerCase()}! 💪`,
            hints: [`You need the ${primaryType} block.`],
            expectedOutput: primaryType === "print" ? "I can code!" : "15",
            dataTypesRequired: [primaryType],
            difficulty: "Medium",
          },
        ],
      };
    }

    res.status(200).json({
      currentLessonId:    lessonId,
      currentLessonTitle: currentLesson.title,
      missingTypes,
      reviewContent: {
        lessonMaterial:      reviewData.lessonMaterial,
        activity:            reviewData.activity,
        assessmentQuestions: reviewData.assessmentQuestions,
      },
      generatedBy: "ai",
      message: "Review content generated! 🎉",
    });

  } catch (err) {
    console.error("🔥 Generate review content error:", err);
    res.status(500).json({ message: "Failed to generate review content", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ROUTE: GET /api/ai/weakspots/:userId
// ─────────────────────────────────────────────
export const getWeakSpots = async (req, res) => {
  try {
    const { userId }  = req.params;
    const allProgress = await UserLessonProgress.find({ userId }).lean();
    const weakSpots   = [];

    for (const progress of allProgress) {
      for (const attempt of progress.activityAttempts || []) {
        if (attempt.totalAttempts >= 2 && !attempt.correct) {
          weakSpots.push({
            lessonId:      progress.lessonId,
            activityId:    attempt.activityId,
            totalAttempts: attempt.totalAttempts,
            timeSpent:     attempt.timeSeconds,
          });
        }
      }
    }

    res.status(200).json({ weakSpots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching weak spots", error: err.message });
  }
};