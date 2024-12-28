// src/index.ts
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db";
import userRoutes from "./src/routes/user.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the Node-TS-Mongo app!");
});

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
