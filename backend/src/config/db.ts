// src/config/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
    process.exit(1);
  }
}
