// server.js
// Entry point del servicio PREDICT
require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const predictRoutes = require("./routes/predictRoutes");
const { initModel } = require("./services/tfModelService");
const Predictor = require('./model/predictor');
const PORT = process.env.PORT || 3002;
const app = express();
app.use(express.json()); 
mongoose.connect('mongodb://localhost:27017/prediccion')
.then(()=>{
  console.log('Conexión a la base de datos establecida');
}).catch(err=>{
  console.error('Error de conexion a la base de datos:',err);
});
app.get('/prediccion/predictions/:id', async (req, res) => { 
    let predictionId = req.params.id; 
 
    try { 
        const prediction = await Predictor.findById(predictionId); 
         
        if (!prediction) { 
            return res.status(404).send({ mensaje: 'El elemento no existe' }); 
        } 
         
        res.status(200).send({ prediction }); 
    } catch (err) { 
        res.status(500).send({ mensaje: `Error al realizar la petición: ${err}` }); 
    } 
});
app.post('/prediccion/predictions', async (req, res) => { 
console.log('POST /prediccion/predictions'); 
console.log(req.body); 
// Crear un nuevo producto utilizando req.body 
let prediction = new Predictor(req.body); 
try { 
// Guardar el producto en la base de datos 
const predictionStored = await prediction.save(); 
res.status(200).send({ prediction: predictionStored }); 
} catch (err) { 
res.status(500).send({ mensaje: `Error al salvar en la base de datos: ${err}` }); 
} 
});


// Servir la carpeta del modelo TFJS (model/model.json + pesos)
const modelDir = path.resolve(__dirname, "model");
app.use("/model", express.static(modelDir));

// Rutas del servicio PREDICT
app.use("/", predictRoutes);

// Arranque del servidor + carga del modelo
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
//