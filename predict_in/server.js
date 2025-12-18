require("dotenv").config({ path: "../.env.docker" });
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const predictRoutes = require("./routes/predictRoutes");
const { initModel, predict } = require("./services/tfModelService");
const Predictor = require('./model/predictor');

const PORT = process.env.PORT || 3002;
const app = express();

app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/prediccion')
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch(err => console.error('Error de conexión a la base de datos:', err));

// Obtener predicción por ID
app.get('/prediccion/predictions/:id', async (req, res) => { 
  try {
    const prediction = await Predictor.findById(req.params.id);
    if (!prediction) return res.status(404).send({ mensaje: 'El elemento no existe' });
    res.status(200).send({ prediction });
  } catch (err) {
    res.status(500).send({ mensaje: `Error al realizar la petición: ${err.message}` });
  }
});

// Crear nueva predicción
app.post('/prediccion/predictions', async (req, res) => {
  try {
    console.log('POST body recibido:', JSON.stringify(req.body, null, 2));

    const features = req.body.features;
    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).send({ mensaje: 'El input debe ser un array de números' });
    }

    if (!features.every(f => typeof f === 'number')) {
      return res.status(400).send({ mensaje: 'Todos los elementos de features deben ser números' });
    }

    const meta = req.body.meta && typeof req.body.meta === 'object' ? req.body.meta : {};

    const predictionResult = await predict(features);

    const prediction = new Predictor({
      features,
      result: predictionResult,
      meta
    });

    const predictionStored = await prediction.save();

    console.log('Documento guardado en MongoDB:', predictionStored);

    res.status(200).send({ prediction: predictionStored });

  } catch (err) {
    console.error('Error POST /prediccion/predictions:', err);
    res.status(500).send({ mensaje: `Error al predecir y guardar: ${err.message}` });
  }
});

// Servir modelo
app.use("/model", express.static(path.resolve(__dirname, "model")));

// Otras rutas
app.use("/", predictRoutes);

// Iniciar servidor + carga del modelo
app.listen(PORT, async () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`[PREDICT] Servicio escuchando en ${serverUrl}`);
  try {
    await initModel(serverUrl);
  } catch (err) {
    console.error("Error al inicializar modelo:", err);
    process.exit(1);
  }
});
