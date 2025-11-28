'use strict'
const Prediccion = require('../model/predictor');
async function crearPrediccion(datosProtocolo){
    try{
        const Prediccion = new Prediccion(datosProtocolo);
        return await Prediccion.save()
    }catch(err){
        throw new Error('Ups, no he podido crear la predicción')
    }
}
module.exports={
    crearPrediccion
};