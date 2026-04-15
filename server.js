import express from "express";
import connectDB from "./src/config/db.config.js";
import routes from "./src/routes/index.js";
import dotenv from "dotenv";
dotenv.config();

//1. Conectarse a la base de datos
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

connectDB();

//2.Definición de la ruta principal
app.get("/", (req, res) => {
  res.send("API is working successfully");
});
app.use("/api", routes);

//2.1 Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.originalUrl,
  });
});

//3.Escucha del puerto
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
