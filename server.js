import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(".")); // slúži na obsluhu index.html

// --- ENV VARS z Render / VPS ---
const API_KEY = process.env.NESTEX_API_KEY;
const API_SECRET = process.env.NESTEX_API_SECRET;

// Helper – GET request na NestEx API
async function nestexGet(endpoint) {
  const url = `https://openapi.nestex.one/${endpoint}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "api-key": API_KEY,
        "api-secret": API_SECRET,
      },
    });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { status: res.status, data };
    } catch {
      return { status: res.status, data: text };
    }
  } catch (err) {
    console.error("NestEx API chyba:", err.message);
    return { status: 500, data: { error: err.message } };
  }
}

// --- ROUTES ---
app.post("/api/nestex/checktoken", async (req, res) => {
  const r = await nestexGet("api/v1/account/checktoken");
  res.status(r.status).send(r.data);
});

app.post("/api/nestex/balances", async (req, res) => {
  const r = await nestexGet("api/v1/account/balances");
  res.status(r.status).send(r.data);
});

app.post("/api/nestex/orders", async (req, res) => {
  const r = await nestexGet("api/v1/order/openOrders");
  res.status(r.status).send(r.data);
});

// --- START SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Crionic NestEx proxy beží na porte ${PORT}`));
