const mongoose = require('mongoose');

const DesignSchema = new mongoose.Schema(
  {
    image: { type: String }, // Base64 design image (Preethi/Abirami)
    config: { type: Object }, // Placed stickers, paths, color, shapes config
    type: { type: String, required: true }, // 'bag', 'towel', 'paperfile', 'napkin', 'bedsheet', 'cupcoaster'
    title: { type: String }, // Title meta for compatibility
    description: { type: String }, // Description meta for compatibility
    fileUrl: { type: String }, // Direct path on disk if saved as static image file
  },
  { timestamps: true }
);

module.exports = mongoose.models.Design || mongoose.model("Design", DesignSchema);
