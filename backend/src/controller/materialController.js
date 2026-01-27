import LessonMaterial from "../model/LessonMaterial.js";

// -------------------------------------------------------
// CREATE MATERIAL — ORDER ALWAYS SEQUENTIAL
// -------------------------------------------------------
export const createMaterial = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, overview, contents, position } = req.body; // optional position to insert

    // Fetch existing materials
    const materials = await LessonMaterial.find({ lessonId }).sort({ order: 1 });

    let newOrder;
    if (position != null && position >= 0 && position <= materials.length) {
      // Insert at specific position
      materials.splice(position, 0, { title, overview, contents }); // temporary placeholder
      materials.forEach((m, index) => {
        if (m._id) m.order = index;
      });

      // Save updated orders for existing materials
      await Promise.all(
        materials.filter(m => m._id).map(m => LessonMaterial.findByIdAndUpdate(m._id, { order: m.order }))
      );

      newOrder = position;
    } else {
      // Append at the end
      newOrder = materials.length;
    }

    const material = new LessonMaterial({
      lessonId,
      title,
      overview,
      contents,
      order: newOrder,
    });

    await material.save();
    res.status(201).json(material);

  } catch (err) {
    res.status(500).json({
      message: "Error creating material",
      error: err.message,
    });
  }
};

// -------------------------------------------------------
// GET MATERIAL BY ID
// -------------------------------------------------------
export const getMaterialById = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await LessonMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.status(200).json(material);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------------------------------------------
// GET MATERIALS BY LESSON — SORTED ORDER
// -------------------------------------------------------
export const getMaterialsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const materials = await LessonMaterial.find({ lessonId }).sort({ order: 1 });

    res.status(200).json(materials);

  } catch (err) {
    res.status(500).json({
      message: "Error fetching materials",
      error: err.message,
    });
  }
};

// -------------------------------------------------------
// REORDER MATERIALS (DRAG & DROP) — FIXED SEQUENTIAL ORDER
// -------------------------------------------------------
export const reorderMaterials = async (req, res) => {
  try {
    const { materials } = req.body; // [{ id, order }]
    if (!Array.isArray(materials)) {
      return res.status(400).json({ message: "Invalid materials array" });
    }

    // Normalize order to sequential integers
    materials.sort((a, b) => a.order - b.order);
    await Promise.all(
      materials.map((m, index) =>
        LessonMaterial.findByIdAndUpdate(m.id, { order: index })
      )
    );

    res.json({ message: "Materials reordered successfully" });

  } catch (err) {
    res.status(500).json({
      message: "Error reordering materials",
      error: err.message,
    });
  }
};

// -------------------------------------------------------
// DELETE MATERIAL — AUTO REINDEX ORDER
// -------------------------------------------------------
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await LessonMaterial.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Material not found" });
    }

    // 🔥 Reindex remaining materials sequentially
    const materials = await LessonMaterial.find({ lessonId: deleted.lessonId }).sort({ order: 1 });
    for (let i = 0; i < materials.length; i++) {
      if (materials[i].order !== i) {
        materials[i].order = i;
        await materials[i].save();
      }
    }

    res.json({ message: "Material deleted and order reindexed" });

  } catch (err) {
    res.status(500).json({
      message: "Error deleting material",
      error: err.message,
    });
  }
};

// -------------------------------------------------------
// UPDATE MATERIAL
// -------------------------------------------------------
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, overview, contents } = req.body;

    const updated = await LessonMaterial.findByIdAndUpdate(
      id,
      { title, overview, contents },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({
      message: "Error updating material",
      error: err.message,
    });
  }
};
