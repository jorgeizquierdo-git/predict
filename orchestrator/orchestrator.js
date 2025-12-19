require("dotenv").config({ path: "../.env.docker" });
const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
const PORT = process.env.ORCHESTRATOR_PORT;
const app = express();

app.use(express.json());


app.post("/run", async (req, res) => {
  try {

    const among = await fetchAquireSiViu();
    const predictResult = await fetchPredictSiViu(among);
    const response = {
      dataId: among.values[0][1],
      predictionId: predictResult.predictionId,
      prediction: predictResult.prediction,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

function extraureConsumsIDates(among) {
  const values = among.values;

  if (!values || values.length < 3) {
    throw new Error("INSUFFICIENT_AQUIRE_DATA");
  }

  const consumo_t = values[0][2];
  const consumo_t_1 = values[1][2];
  const consumo_t_2 = values[2][2];

  const fecha = new Date(values[0][0]);

  const hora = fecha.getUTCHours();
  const dia_semana = fecha.getUTCDay();
  const mes = fecha.getUTCMonth() + 1;
  const dia_mes = fecha.getUTCDate();

  return [
    consumo_t,
    consumo_t_1,
    consumo_t_2,
    hora,
    dia_semana,
    mes,
    dia_mes
  ];
}

async function fetchAquireSiViu() {
  const baseUrl = process.env.URL_AQUIRE_SERVICE;

  const healthResponse = await fetch(`${baseUrl}/health`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const statusResponse = await fetch(`${baseUrl}/ready`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!healthResponse.ok) {
    throw new Error(`AQUIRE_HEALTH_BAD_STATUS:${healthResponse.status}`);
  }

  const healthJson = await healthResponse.json();
  const statusJson = await statusResponse.json();

if (healthJson.status !== "ok" || statusJson.status !== "ready") {
  throw new Error("AQUIRE_NOT_READY");
}


  const dataResponse = await fetch(`${baseUrl}/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}) 
  });

  if (!dataResponse.ok) {
    throw new Error(`AQUIRE_DATA_BAD_STATUS:${dataResponse.status}`);
  }

  const json = await dataResponse.json();

  if (!json || !json.among || !Array.isArray(json.among.values)) {
    throw new Error("AQUIRE_INVALID_RESULT");
  }

  return json.among;
}
const { randomUUID } = require("crypto");
async function fetchPredictSiViu(among) {
  const baseUrl = process.env.URL_PREDICT_SERVICE;

  const healthResponse = await fetch(`${baseUrl}/health`, {
  method: "GET",
  headers: { "Content-Type": "application/json" }
});
const statusResponse = await fetch(`${baseUrl}/ready`, {
  method: "GET",
  headers: { "Content-Type": "application/json" }
});

if (!healthResponse.ok) {
  throw new Error(`PREDICT_HEALTH_BAD_STATUS:${healthResponse.status}`);
}

if (!statusResponse.ok) {
  throw new Error(`PREDICT_READY_BAD_STATUS:${statusResponse.status}`);
}

const healthJson = await healthResponse.json();
const statusJson = await statusResponse.json();

if (healthJson.status !== "ok" || statusJson.status !== "ready") {
  throw new Error("PREDICT_NOT_READY");
}


  const features = extraureConsumsIDates(among);

  const body = {
    features,
    meta: {
      featureCount: features.length,
      dataId: among.values[0][1],
      source: "orchestrator",
      correlationId: randomUUID()
    }
  };
  const dataResponse = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!dataResponse.ok) {
    throw new Error(`PREDICT_BAD_STATUS:${dataResponse.status}`);
  }

  return await dataResponse.json();
}


