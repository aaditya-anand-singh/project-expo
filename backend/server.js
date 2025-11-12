import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import systemRoutes from "./routes/systemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import presentationRoutes from "./routes/presentationRoutes.js";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { dbName: "gestureControl" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Routes
app.use("/api/system", systemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/presentation", presentationRoutes);
app.use("/slides", express.static("slides"));
app.use("/uploads", express.static("uploads"));


// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
