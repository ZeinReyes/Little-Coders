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
// Returns the MISSING block types (not concepts)
// ─────────────────────────────────────────────
export const checkNeedsReview = async (req, res) => {
  try {
    console.log("🔵 [RULE] Checking if review needed");
    const { userId, lessonId, currentFailures, missingTypes } = req.body;

    if (!userId || !lessonId || currentFailures === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse missingTypes if it's a string
    let parsedMissingTypes = [];
    if (missingTypes) {
      parsedMissingTypes = typeof missingTypes === 'string' 
        ? JSON.parse(missingTypes) 
        : missingTypes;
    }

    // ✅ RULE: If currentFailures >= 2, user needs review
    const needsReview = currentFailures >= 2;

    if (!needsReview) {
      return res.status(200).json({
        needsReview: false,
        message: "Keep trying! You can do it! 💪",
      });
    }

    // ✅ User needs review — return the missing block types
    const uniqueMissingTypes = [...new Set(parsedMissingTypes)];
    
    console.log(`⚠️ User failed ${currentFailures} times, missing types:`, uniqueMissingTypes);

    return res.status(200).json({
      needsReview: true,
      currentFailures,
      missingTypes: uniqueMissingTypes,
      message: `You've tried ${currentFailures} times. These blocks are giving you trouble: ${uniqueMissingTypes.join(', ')}. Want a quick review lesson? 📚`,
    });

  } catch (err) {
    console.error("🔥 Check review error:", err);
    res.status(500).json({ message: "Failed to check review status", error: err.message });
  }
};

// ─────────────────────────────────────────────
// AI GENERATION: Create review lesson + activity + assessment
// Based on the specific missing block types
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
      print: "Print statements",
      variable: "Variables",
      add: "Addition",
      subtract: "Subtraction",
      multiply: "Multiplication",
      divide: "Division",
      equal: "Equal comparison",
      notequal: "Not equal comparison",
      less: "Less than",
      lessequal: "Less than or equal",
      greater: "Greater than",
      greaterequal: "Greater than or equal",
      if: "If statements",
      elif: "Elif statements",
      else: "Else statements",
      while: "While loops",
      for: "For loops",
      "do-while": "Do-while loops",
    };

    const missingConcepts = missingTypes.map(t => blockTypeNames[t] || t).join(", ");

    console.log(`📚 Generating review for: ${missingConcepts}`);

    // ── Ask AI to generate personalized review lesson ──
    const systemPrompt =
      "You are an expert kids coding teacher for Little Coders, a drag-and-drop Python coding platform. " +
      "You create simple, fun, personalized review lessons that target specific coding concepts kids struggled with. " +
      "Keep explanations VERY simple (grade 3-5 level), fun, encouraging, with emojis. " +
      "Always respond with ONLY valid JSON. No markdown, no code blocks, no extra text.";

    const userPrompt = `
A student is working on "${currentLesson.title}" but is having trouble with these specific blocks:
${missingConcepts}

Create a SHORT personalized review lesson to help them understand these concepts.

Respond with ONLY this JSON:
{
  "lessonMaterial": {
    "title": "short catchy title (e.g., 'Let's Master Print Blocks!')",
    "overview": "1-2 sentences explaining what we'll learn",
    "contents": [
      "First paragraph explaining the concept simply with examples and emojis",
      "Second paragraph with a simple example or tip"
    ]
  },
  "activity": {
    "name": "activity name (e.g., 'Practice Using Print')",
    "instructions": "Clear simple instruction for this practice activity with emoji",
    "hints": ["hint 1", "hint 2", "hint 3"],
    "expectedOutput": "exactly what the output should look like",
    "dataTypesRequired": ["list of required block types from the missing types"],
    "difficulty": "easy",
    "timeLimit": 180
  },
  "assessmentQuestions": [
    {
      "instructions": "assessment question 1 instructions with emoji",
      "hints": ["hint 1", "hint 2"],
      "expectedOutput": "expected output",
      "dataTypesRequired": ["required blocks"],
      "difficulty": "Easy"
    },
    {
      "instructions": "assessment question 2 instructions with emoji",
      "hints": ["hint 1", "hint 2"],
      "expectedOutput": "expected output",
      "dataTypesRequired": ["required blocks"],
      "difficulty": "Medium"
    }
  ]
}

CRITICAL RULES:
- lessonMaterial.contents must be an array of 2 strings (paragraphs)
- Each paragraph should be 2-4 sentences, simple language, with emojis
- activity.dataTypesRequired MUST ONLY include these valid types: ${missingTypes.join(", ")}
- assessmentQuestions must have exactly 2 questions
- dataTypesRequired arrays must ONLY use these types: print, variable, add, subtract, multiply, divide, equal, notequal, less, lessequal, greater, greaterequal, if, elif, else, while, for, do-while
- Keep everything simple and fun for kids ages 8-12
- NEVER ask the student to print their name, favorite phrase, or anything personal.
- NEVER use placeholders like "your name" or "your favorite phrase".
- expectedOutput must always be a fixed literal string like "Hello, World!" or "5".
- The instructions must clearly match the exact expectedOutput.
- activity.timeLimit should be 180 seconds (3 minutes)
- Use lots of encouraging language and emojis!`;

    let reviewData;
    try {
      const raw  = await callOpenRouter(systemPrompt, userPrompt, 2000);
      reviewData = safeParseJSON(raw);
      console.log("✅ AI generated review content");
    } catch (err) {
      console.warn("⚠️  AI generation failed, using structured fallback");
      
      // Fallback with basic content based on missing types
      const primaryType = missingTypes[0];
      const conceptName = blockTypeNames[primaryType] || primaryType;
      
      reviewData = {
        lessonMaterial: {
          title: `Let's Review ${conceptName}! 🎯`,
          overview: `Having trouble with ${conceptName}? No worries! Let's practice together and make it super easy! 🌟`,
          contents: [
            `${conceptName} can be tricky at first, but once you get the hang of it, it's actually really fun! 🎉 Think of it like building with LEGO blocks - each piece has its own special purpose. When you use ${conceptName.toLowerCase()}, you're telling the computer exactly what to do, step by step! 🤖`,
            `Here's a helpful tip: Always take your time and read the instructions carefully. If you get stuck, that's totally okay! Even the best programmers take time to think through their code. Remember, every mistake is a chance to learn something new! 💪✨`
          ]
        },
        activity: {
          name: `Practice ${conceptName}`,
          instructions: `Let's practice using ${conceptName.toLowerCase()}! Drag the blocks to create a program that uses ${conceptName.toLowerCase()}. Take your time and try your best! 🚀`,
          hints: [
            `Remember to use the ${primaryType} block!`,
            `Read the expected output carefully - that's what your program should create!`,
            `Take it step by step - one block at a time! 🧩`
          ],
          expectedOutput: primaryType === "print" ? "Hello!" : "5",
          dataTypesRequired: [primaryType],
          difficulty: "easy",
          timeLimit: 180
        },
        assessmentQuestions: [
          {
            instructions: `Show me you can use ${conceptName.toLowerCase()}! Create a simple program using the ${primaryType} block. 🎯`,
            hints: [
              `Use the ${primaryType} block`,
              `Check the expected output below!`
            ],
            expectedOutput: primaryType === "print" ? "Great job!" : "10",
            dataTypesRequired: [primaryType],
            difficulty: "Easy"
          },
          {
            instructions: `Now let's try something a bit more challenging! Use ${conceptName.toLowerCase()} to create the output shown below. 💪`,
            hints: [
              `You'll need to use the ${primaryType} block`,
              `Take your time and read carefully!`
            ],
            expectedOutput: primaryType === "print" ? "I can code!" : "15",
            dataTypesRequired: [primaryType],
            difficulty: "Medium"
          }
        ]
      };
    }

    // ── Return the generated review content ──
    res.status(200).json({
      currentLessonId: lessonId,
      currentLessonTitle: currentLesson.title,
      missingTypes,
      reviewContent: {
        lessonMaterial: reviewData.lessonMaterial,
        activity: reviewData.activity,
        assessmentQuestions: reviewData.assessmentQuestions,
      },
      generatedBy: "ai",
      message: "Review content generated successfully! 🎉"
    });

  } catch (err) {
    console.error("🔥 Generate review content error:", err);
    res.status(500).json({ 
      message: "Failed to generate review content", 
      error: err.message 
    });
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