import cors from "cors";
import express from "express";
import env from "./src/config/env.config.js";
import connectDB from "./src/config/db.config.js";
import routes from "./src/routes/index.js";

//1. Conectarse a la base de datos
const app = express();
const PORT = env.port;

const corsOptions = {
  origin(origin, callback) {
    //Sin header Origin: Postman, curl, el healthcheck de Render o pruebas automatizadas.
    if (!origin || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

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

//3.Puerto
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${env.nodeEnv}]`);
});
