import dotenv from "dotenv";

//Se carga el .env aquí y no en server.js porque en ESM los imports se evalúan antes que el
//cuerpo del módulo que los importa: si esperáramos, la validación de abajo correría sin valores.
dotenv.config();

//Sin estas la API no puede arrancar: o no hay base de datos, o no se pueden firmar tokens,
//o el navegador no podría hablar con la API.
const REQUIRED_VARS = [
  "MONGO_URL",
  "JWT_SECRET",
  "JWT_REFRESH_TOKEN",
  "CORS_ALLOWED_ORIGINS",
];

//El error nombra la variable que falta, nunca su valor: los secretos no se imprimen.
const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(", ")}. Revisa .env.example`,
    );
  }
};

//"http://a.com, http://b.com" → ["http://a.com", "http://b.com"]
const parseOrigins = (value) => {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

validateEnv();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 4000,
  mongoUrl: process.env.MONGO_URL,
  allowedOrigins: parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  //Reservada: hoy ningún módulo la consume. No hay redirecciones, correos ni callbacks.
  frontendUrl: process.env.FRONTEND_URL || "",
};

export default env;
