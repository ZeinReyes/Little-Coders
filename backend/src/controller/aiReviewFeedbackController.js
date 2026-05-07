// ══════════════════════════════════════════════════════════
// controllers/aiReviewFeedbackController.js
// ══════════════════════════════════════════════════════════
import AIReviewFeedback from "../model/AIReviewFeedback.js";
 
// ─────────────────────────────────────────────
// POST /api/ai/review-feedback
// Called by the student after the review session
// ─────────────────────────────────────────────
export const submitReviewFeedback = async (req, res) => {
  try {
    const { userId, lessonId, missingTypes, helpful, reasons, sessionId } = req.body;
 
    if (!userId || !lessonId || helpful === undefined) {
      return res.status(400).json({ message: "Missing required fields: userId, lessonId, helpful" });
    }
 
    const feedback = await AIReviewFeedback.create({
      userId,
      lessonId,
      missingTypes: missingTypes || [],
      helpful:      Boolean(helpful),
      reasons:      helpful ? [] : (reasons || []),
      sessionId,
    });
 
    console.log(`📬 Feedback saved [${helpful ? "👍" : "👎"}] for lesson ${lessonId} by user ${userId}`);
 
    return res.status(201).json({
      message: "Feedback saved! Thank you 🙏",
      feedbackId: feedback._id,
    });
  } catch (err) {
    console.error("🔥 Submit feedback error:", err);
    res.status(500).json({ message: "Failed to save feedback", error: err.message });
  }
};
 
// ─────────────────────────────────────────────
// GET /api/admin/ai-review-feedback
// Admin: full paginated list with filters
// ─────────────────────────────────────────────
export const getAdminFeedbackList = async (req, res) => {
  try {
    const {
      page     = 1,
      limit    = 20,
      helpful,          // "true" | "false" | undefined
      lessonId,
      missingType,      // filter by a single block type
    } = req.query;
 
    const filter = {};
    if (helpful !== undefined)  filter.helpful   = helpful === "true";
    if (lessonId)               filter.lessonId  = lessonId;
    if (missingType)            filter.missingTypes = missingType;
 
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await AIReviewFeedback.countDocuments(filter);
 
    const items = await AIReviewFeedback.find(filter)
      .populate("userId",   "name email")
      .populate("lessonId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
 
    return res.status(200).json({
      total,
      page:        Number(page),
      totalPages:  Math.ceil(total / Number(limit)),
      items,
    });
  } catch (err) {
    console.error("🔥 Admin feedback list error:", err);
    res.status(500).json({ message: "Failed to fetch feedback", error: err.message });
  }
};
 
// ─────────────────────────────────────────────
// GET /api/admin/ai-review-feedback/summary
// Admin: aggregated stats for the reports dashboard
// ─────────────────────────────────────────────
export const getAdminFeedbackSummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
 
    // Overall counts
    const [totalCount, helpfulCount] = await Promise.all([
      AIReviewFeedback.countDocuments({ createdAt: { $gte: since } }),
      AIReviewFeedback.countDocuments({ createdAt: { $gte: since }, helpful: true }),
    ]);
 
    // Top not-helpful reasons (flatten arrays and count)
    const reasonAgg = await AIReviewFeedback.aggregate([
      { $match: { helpful: false, createdAt: { $gte: since } } },
      { $unwind: "$reasons" },
      { $group: { _id: "$reasons", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
 
    // Worst-rated lessons (most not-helpful)
    const lessonAgg = await AIReviewFeedback.aggregate([
      { $match: { helpful: false, createdAt: { $gte: since } } },
      { $group: { _id: "$lessonId", notHelpfulCount: { $sum: 1 } } },
      { $sort: { notHelpfulCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "lessons",
          localField: "_id",
          foreignField: "_id",
          as: "lesson",
        },
      },
      { $unwind: { path: "$lesson", preserveNullAndEmpty: true } },
      { $project: { lessonTitle: "$lesson.title", notHelpfulCount: 1 } },
    ]);
 
    // Most problematic block types (from not-helpful sessions)
    const blockAgg = await AIReviewFeedback.aggregate([
      { $match: { helpful: false, createdAt: { $gte: since } } },
      { $unwind: "$missingTypes" },
      { $group: { _id: "$missingTypes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
 
    // Daily trend (last N days)
    const dailyAgg = await AIReviewFeedback.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date:    { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            helpful: "$helpful",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);
 
    // Reshape daily trend
    const dailyMap = {};
    for (const row of dailyAgg) {
      const { date, helpful } = row._id;
      if (!dailyMap[date]) dailyMap[date] = { date, helpful: 0, notHelpful: 0 };
      if (helpful) dailyMap[date].helpful += row.count;
      else         dailyMap[date].notHelpful += row.count;
    }
    const dailyTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
 
    return res.status(200).json({
      period:          `Last ${days} days`,
      totalFeedback:   totalCount,
      helpfulCount,
      notHelpfulCount: totalCount - helpfulCount,
      helpfulRate:     totalCount ? Math.round((helpfulCount / totalCount) * 100) : 0,
      topReasons:      reasonAgg.map(r => ({ reason: r._id, count: r.count })),
      worstLessons:    lessonAgg.map(l => ({ lessonId: l._id, title: l.lessonTitle, notHelpfulCount: l.notHelpfulCount })),
      problematicBlocks: blockAgg.map(b => ({ block: b._id, count: b.count })),
      dailyTrend,
    });
  } catch (err) {
    console.error("🔥 Feedback summary error:", err);
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
};
 