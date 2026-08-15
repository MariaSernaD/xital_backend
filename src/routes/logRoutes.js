import express from "express";
import { createLog } from "../controllers/logController.js";

const router = express.Router();

//Público a propósito: también captura errores de usuarios sin sesión.
router.post("/logs", createLog);

export default router;
