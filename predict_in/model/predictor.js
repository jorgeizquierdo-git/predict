const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
  featureCount: { type: Number },
  dataId: { type: String },
  source: { type: String }
}, { _id: false });

const predictorSchema = new mongoose.Schema({
  features: { type: [Number], required: true },
  result: { type: Number, required: true },
  meta: metaSchema,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'predictions' });

module.exports = mongoose.model('Predictor', predictorSchema);
