import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testRouter } from "./routes/test";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ["https://my-qa-bot.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "QABOT Backend running!" });
});

app.use("/api/test", testRouter);

app.listen(PORT, () => {
  console.log(`🚀 QABOT Backend running on port ${PORT}`);
});