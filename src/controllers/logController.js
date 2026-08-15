import jwt from "jsonwebtoken";
import Log from "../models/Log.js";

const LEVELS = ["error", "warn", "info"];
const SOURCES = ["frontend", "backend"];
const MAX_MESSAGE_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 4000;

//El endpoint es público: el token es opcional y solo sirve para atribuir el log.
//A diferencia de authMiddleware, aquí un token ausente o inválido no es un 401.
const resolveUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.userId;
  } catch (error) {
    //Token inválido o expirado: el log se guarda igual, pero sin usuario.
    return null;
  }
};

//Recorta el context para que un payload gigante no llene la colección.
const trimContext = (context) => {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    return {};
  }
  const serialized = JSON.stringify(context);
  if (serialized.length <= MAX_CONTEXT_LENGTH) {
    return context;
  }
  return { truncated: true, preview: serialized.slice(0, MAX_CONTEXT_LENGTH) };
};

const createLog = async (req, res) => {
  try {
    const { level, event, message, source, context } = req.body;

    //Validación explícita: el endpoint es público y no hay cadenas de express-validator.
    const errors = [];
    if (!LEVELS.includes(level)) {
      errors.push({ field: "level", message: `level must be one of: ${LEVELS.join(", ")}` });
    }
    if (typeof event !== "string" || !event.trim()) {
      errors.push({ field: "event", message: "event is required" });
    }
    if (typeof message !== "string" || !message.trim()) {
      errors.push({ field: "message", message: "message is required" });
    }
    if (source !== undefined && !SOURCES.includes(source)) {
      errors.push({ field: "source", message: `source must be one of: ${SOURCES.join(", ")}` });
    }
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }

    const log = await Log.create({
      level,
      event: event.trim(),
      message: message.trim().slice(0, MAX_MESSAGE_LENGTH),
      source: source || "frontend",
      context: trimContext(context),
      user: resolveUserId(req),
    });

    res.status(201).json(log);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { createLog };
