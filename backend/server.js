import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import digilockerUser from "./models/DigilockerUser.js";
import verificationRoutes from "./routes/verification.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth/", authRoutes);
app.use("/api/digiusers/", digilockerUser);
app.use("/api/verification/", verificationRoutes);

app.get("/",(req,res)=>{
    res.send("API is running...");
})

app.get("/",(req,res)=>{
    res.send("API is running...");
})

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port " + (process.env.PORT || 5000))
);
