'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductoSchema = new Schema({
nombre: { type: String, required: true },
precio: { type: Number, required: true },
descripcion: String,
categoria: String,
stock: Number
});
module.exports = mongoose.model('Producto', ProductoSchema);
