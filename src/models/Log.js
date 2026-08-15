import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      enum: ["error", "warn", "info"],
    },
    event: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      enum: ["frontend", "backend"],
      default: "frontend",
    },
    //Datos libres del evento: boundary, url, componentStack, kind del error...
    context: {
      type: Object,
      default: {},
    },
    //Opcional: el endpoint es público, así que solo se llena si hay token válido.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Log = mongoose.model("Log", logSchema);
export default Log;
