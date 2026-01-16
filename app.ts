import dotenv from "dotenv";
import express from "express";

import cookieParse from "cookie-parser";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import { StatusCode } from "./utils/status-code.js";
import reviewSliderRoutes from "./router/review-slider.routes.js";

const app = express();

dotenv.config({ path: [".env"] });

app.get("/", (_req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Middleware
app.use(express.json());
app.use(cookieParse());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/review-slider", reviewSliderRoutes);

// Global Error Handler
app.use(errorHandler);

// Handle 404 - This must be after all other routes
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res
    .status(StatusCode.NOT_FOUND)
    .json({ error: "Not Found", path: req.originalUrl });
});

// Error handling middleware - This must be after all other middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Error:", err.message);
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Database connection
const mongoDbUrl = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME;

if (!mongoDbUrl || !dbName) {
  throw new Error("Missing MongoDB connection environment variables.");
}
connectDB({ url: mongoDbUrl, dbName });

export default app;
