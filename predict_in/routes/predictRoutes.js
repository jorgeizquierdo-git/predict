// routes/predictRoutes.js
const express = require("express");
const router = express.Router();
const { predict } = require("../services/tfModelService");
const Prediccion = require("../model/predictor"); // Asegúrate que este es tu modelo correcto

// Rutas de salud
router.get("/health", (req, res) => res.json({ 
    status: "ok" ,
    service:"predict"
}));
router.get("/ready", (req, res) => res.json({ status: "ready" }));

// Endpoint para hacer predicciones y guardarlas en MongoDB
router.post("/predict", async (req, res) => {
  try {
    const inputData = req.body;

    const prediction = await predict(inputData);

    const predictionStored = await Prediccion.create({
      features: inputData.features,
      meta: inputData.meta ?? null,
      output: prediction
    });

    res.status(200).json({ prediction: predictionStored });

  } catch (err) {
    console.error("Error en predicción:", err);
    res.status(500).json({ error: "Error procesando predicción" });
  }
});
module.exports = router;
