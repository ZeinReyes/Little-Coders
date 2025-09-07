import LessonMaterial from "../model/LessonMaterial.js";

export const createMaterial = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, contents } = req.body;

    const last = await LessonMaterial.find({ lessonId })
      .sort({ order: -1 })
      .limit(1);
    const nextOrder = last.length ? (last[0].order ?? 0) + 1 : 0;

    const material = new LessonMaterial({
      lessonId,
      title,
      contents,
      order: nextOrder,
    });

    await material.save();
    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: "Error creating material", error: err.message });
  }
};

export const getMaterialsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const materials = await LessonMaterial.find({ lessonId }).sort({ order: 1, createdAt: 1 });
    res.status(200).json(materials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching materials", error: err.message });
  }
};

export const reorderMaterials = async (req, res) => {
  try {
    const { materials } = req.body; 

    await Promise.all(
      materials.map((m) =>
        LessonMaterial.findByIdAndUpdate(m.id, { order: m.order }, { new: true })
      )
    );

    res.json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error reordering materials", error: err.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LessonMaterial.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.json({ message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting material", error: err.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contents } = req.body;

    const updated = await LessonMaterial.findByIdAndUpdate(
      id,
      { title, contents },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating material", error: err.message });
  }
};
