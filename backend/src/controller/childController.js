import User from "../model/User.js";

// ══════════════════════════════════════════════════════════════════════════════
// GET all children for a parent
// GET /api/users/:id/children
// ══════════════════════════════════════════════════════════════════════════════
export const getChildren = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("children");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.children);
  } catch (err) {
    console.error("getChildren error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// ADD a child
// POST /api/users/:id/children
// body: { name, age, gender, avatar? }
// ══════════════════════════════════════════════════════════════════════════════
export const addChild = async (req, res) => {
  try {
    const { name, age, gender, avatar } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ error: "name, age, and gender are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const child = { name, age, gender, avatar: avatar || "bear", progress: {} };
    user.children.push(child);
    await user.save();

    const added = user.children[user.children.length - 1];
    res.status(201).json({ message: "Child added successfully", child: added });
  } catch (err) {
    console.error("addChild error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE a child
// PUT /api/users/:id/children/:childId
// body: { name?, age?, gender?, avatar? }
// ══════════════════════════════════════════════════════════════════════════════
export const updateChild = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const child = user.children.id(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });

    const { name, age, gender, avatar } = req.body;
    if (name)   child.name   = name;
    if (age)    child.age    = age;
    if (gender) child.gender = gender;
    if (avatar) child.avatar = avatar;

    await user.save();
    res.json({ message: "Child updated successfully", child });
  } catch (err) {
    console.error("updateChild error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// DELETE a child
// DELETE /api/users/:id/children/:childId
// ══════════════════════════════════════════════════════════════════════════════
export const deleteChild = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const child = user.children.id(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });

    child.deleteOne();
    await user.save();
    res.json({ message: "Child removed successfully" });
  } catch (err) {
    console.error("deleteChild error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE child progress
// PATCH /api/users/:id/children/:childId/progress
// body: { lessonId, data } — merges into child.progress
// ══════════════════════════════════════════════════════════════════════════════
export const updateChildProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const child = user.children.id(req.params.childId);
    if (!child) return res.status(404).json({ error: "Child not found" });

    // Merge new progress data into existing progress object
    child.progress = { ...child.progress, ...req.body };
    user.markModified("children");
    await user.save();

    res.json({ message: "Progress updated", progress: child.progress });
  } catch (err) {
    console.error("updateChildProgress error:", err);
    res.status(500).json({ error: "Server error" });
  }
};