const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pasteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  expiry: {
    type: String,
    required: true
  },
  exposure: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  editSlug: {
    type: String,
    required: true
  },
  hits: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
pasteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Paste", pasteSchema);