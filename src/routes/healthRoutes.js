import express from "express";
import { getHealth } from "../controllers/healthController.js";

const router = express.Router();

//Público a propósito: un healthcheck debe responder sin credenciales.
router.get("/health", getHealth);

export default router;
