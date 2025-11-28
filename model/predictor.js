const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  input: { type: Number, required: true },
  output: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prediction", predictionSchema);