
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

connectDB();

app.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
});
