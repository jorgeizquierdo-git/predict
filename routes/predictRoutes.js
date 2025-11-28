// routes/predictRoutes.js
const express = require("express");
const router = express.Router();
const predictController = require("../controllers/predictController");
const { predict } = require("../services/tfModelService");ç
const Prediccion = require("../model/predictor");


// Contrato del servicio PREDICT
router.get("/health", predictController.health);
router.get("/ready", predictController.ready);
router.post("/predict", predictController.doPredict);
router.post("/predict", async (req, res) => {
  try {
    const inputData = req.body;

    const prediction = await predict(inputData);

    // Guardar en Mongo
    await Prediction.create({
      input: inputData,
      output: prediction
    });

    res.json({ prediction });

  } catch (err) {
    console.error("Error en predicción:", err);
    res.status(500).json({ error: "Error procesando predicción" });
  }
});

module.exports = router;
