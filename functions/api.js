const express = require("express");
const Papa = require("papaparse");
const router = express.Router();
const app = express();
const fetch = require("node-fetch");
const serveless = require("serverless-http");

require("dotenv").config();

const api = {
  orders: {
    fetch: async () => {
      const resp = await fetch(`${process.env.EXCEL_KEY}`);
      const data = await resp.text();
      const parsed = await new Promise((resolve, reject) => {
        Papa.parse(data, {
          header: true,
          complete: (result) => resolve(result.data),
          error: reject,
        });
      });

      return parsed;
    },
  },
};

const getOrders = async (req, res) => {
  try {
    const data = await api.orders.fetch();
    const parsed = data
      .map((value) => {
        const obj = {
          Cantidad: value.Cantidad,
          Finalizado: value.Finalizado,
          LlaverosImanesCentros: value.LlaverosImanesCentros,
          FechaEntrega: value.FechaEntrega,
          Total: value.Total,
          Seña: value.Seña,
          Orden: value.Orden,
          Tematica: value.Tematica,
          Envio: value.Envio,
          Horario: value.Horario,
        };
        return obj;
      })
      .filter((o) => o.Orden === req.params.number);
    res.send(parsed);
  } catch (e) {
    console.log(e);
    res.send({ error: "Error" });
  }
};

router.get("/orders/:number", getOrders);

app.use("/.netlify/functions/api", router);

module.exports.handler = serveless(app);
