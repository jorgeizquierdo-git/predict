require("dotenv").config({ path: "../.env.docker" });
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
console.log(process.env.KUNNA_URL)
const PORT = process.env.AQUIRE_PORT || 3001;
const app = express();
let conectao = false;

app.use(express.json());

let KunnaModel;

mongoose.connect(process.env.MONGO_URI_AQUIRE)
  .then(() => {
    console.log("Conexión a la base de datos establecida");
    conectao = true;

    const KunnaSchema = new mongoose.Schema({
      timeStart: { type: Date, required: true },
      timeEnd: { type: Date, required: true },
      columns: [String],
      values: [[mongoose.Schema.Types.Mixed]],
    }, { timestamps: true });

    KunnaSchema.index({ timeStart: 1, timeEnd: 1 }, { unique: true });

    KunnaModel = mongoose.model("KunnaData", KunnaSchema);
  })
  .catch(err => {
    console.error("Error de conexion a la base de datos:", err);
  });

const KUNNA_URL = process.env.KUNNA_URL;
const ALIAS = process.env.ALIAS;

async function fetchKunna(timeStart, timeEnd) {
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

  const response = await fetch(process.env.KUNNA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  return result;
}

async function data(hoy, ayer) {
  return await fetchKunna(ayer, hoy);
}
app.get("/health", (req, res) => res.json({ status: "ok" , service:"aquire"}));
app.get("/ready", (req, res) => res.json({ status: "ready" }));

app.post("/data", async (req, res) => {
  try {
    let hoy = new Date();
    if (hoy.getHours() < 23) {
      hoy = new Date(hoy.getTime() - 86400 * 1000);
    }

    let ayer = new Date(hoy.getTime() - 3 * 86400 * 1000);
    let among = await data(hoy, ayer);

    if (!among) {
      return res.status(404).send({ mensaje: "Kunna me ha dicho que no hay nada" });
    }

    if (conectao && KunnaModel) {
      await KunnaModel.updateOne(
        { timeStart: ayer, timeEnd: hoy },
        {
          $set: {
            columns: among.columns,
            values: among.values
          }
        },
        { upsert: true }
      );
    }

    res.status(200).send({ among });
  } catch (err) {
    console.error(err);
    res.status(500).send({ mensaje: `Error al realizar la petición: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
