import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import { ConnectDb } from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(multer().none());

app.get("/", (req, res) => res.send("Server is running"));

ConnectDb().then(() => {
    app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
})

