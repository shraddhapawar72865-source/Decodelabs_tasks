const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "A menu slug is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may contain lowercase letters, numbers, and hyphens only."]
    },
    name: { type: String, required: [true, "A menu name is required."], trim: true, minlength: 2, maxlength: 100 },
    price: { type: Number, required: [true, "A price is required."], min: [1, "Price must be at least 1."] },
    category: { type: String, required: [true, "A category is required."], trim: true, lowercase: true, maxlength: 30, index: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    prepTime: { type: String, required: true, trim: true, maxlength: 30 },
    image: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    badge: { type: String, trim: true, maxlength: 40, default: "" },
    isAvailable: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

// Supports fast, case-insensitive menu name searches.
menuSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Menu", menuSchema);
