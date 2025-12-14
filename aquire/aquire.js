require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3002;
const app = express();

app.use(express.json());

mongoose.connect(`${process.env.MONGO_URI_PREDICT}`)
  .then(() => {
    console.log('Conexión a la base de datos establecida');
  })
  .catch(err => {
    console.error('Error de conexion a la base de datos:', err);
  });

const KUNNA_URL = process.env.KUNNA_URL;
const ALIAS = process.env.ALIAS;

/**
 * Llama a Kunna con un rango [timeStart, timeEnd]
 * y devuelve el objeto { columns, values }.
 */
async function fetchKunna(timeStart, timeEnd) {
  const url = KUNNA_URL;

  const headers = {
    "Content-Type": "application/json"
  };

  const body = {
    time_start: timeStart.toISOString(),
    time_end: timeEnd.toISOString(),
    filters: [
      { filter: "name", values: ["1d"] },
      { filter: "alias", values: [ALIAS] }
    ],
    limit: 100,
    count: false,
    order: "DESC"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`KUNNA_BAD_STATUS:${response.status}`);
  }

  const json = await response.json();
  const result = json.result;

  if (!result || !Array.isArray(result.columns) || !Array.isArray(result.values)) {
    throw new Error("KUNNA_INVALID_RESULT");
  }

  return result; // { columns, values }
}

async function data(hoy,ayer){

  //ඞ
  fetchKunna(ayer,hoy);


}//<-esto tiene que llamar a fetchKunna() y rercibir date.time para enviarselo a kunna mediante 
app.get('/data', async (req, res) => { 
  try { 
      let bjsk=new Date();
      if (bjsk.getHours() < 23){
        bjsk = new Date(bjsk.getTime() - 86400 * 1000);
      }
      icfn=new Date(bjsk.getTime()- 3 * 86400 * 1000);
      await among=data(bksk,icfn);
      if (!among) { 
          return res.status(404).send({ mensaje: 'Kunna me ha dicho que no' }); 
      }
      res.status(200).send({ among }); 
  } catch (err) { 
      res.status(500).send({ mensaje: `Error al realizar la petición: ${err}` }); 
  } 
});