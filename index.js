const PORT = 8080;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Producto = require('./models/producto'); // Importar el modelo
// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/producto')
.then(() => {
console.log('Conexión a la base de datos establecida');
}).catch(err => {
console.error('Error de conexión a la base de datos:', err);
});
app.get('api/producto/:id',(req,res)=>{
res.status(200).send({ mensaje: `Producto con id ${req.params.id}`})
});
app.listen(8080, () => {
console.log(`API REST ejecutándose en http://localhost:${PORT}/api/producto/:id`);
});