const mongoose = require("mongoose");
const predictionSchema = new mongoose.Schema({
  features: { type: [Number], required: true },
  meta: {
    featureCount: Number,
    dataId: String,
    source: String
  },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Prediction", predictionSchema);