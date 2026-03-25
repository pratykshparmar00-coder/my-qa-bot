import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testRouter } from "./routes/test";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "QABOT Backend running!" });
});

app.use("/api/test", testRouter);

app.listen(PORT, () => {
  console.log(`🚀 QABOT Backend running on port ${PORT}`);
});