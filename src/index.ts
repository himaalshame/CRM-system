import "dotenv/config";
import express from "express";
import cors from "cors";

import clientRoutes from "./routes/client.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CRM API is running",
  });
});

app.use("/api/clients", clientRoutes);

app.listen(5000, () => {
  console.log("🚀 CRM API running on http://localhost:5000");
});