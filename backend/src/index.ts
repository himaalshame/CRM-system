import "dotenv/config";
import express from "express";
import cors from "cors";

import clientRoutes from "./routes/client.routes";
import serviceRoutes from "./routes/service.routes";
import orderRoutes from "./routes/order.routes";
import projectRoutes from "./routes/project.routes";
import employeeRoutes from "./routes/employee.routes";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "CRM API is running",
  });
});

app.use("/clients", clientRoutes);
app.use("/services", serviceRoutes);
app.use("/orders", orderRoutes);
app.use("/projects", projectRoutes);
app.use("/employees", employeeRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(errorHandler);

app.listen(5000, () => {
  console.log("🚀 CRM API running on http://localhost:5000");
});