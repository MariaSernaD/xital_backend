import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Log from "../../src/models/Log.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Log mínimo válido; cada caso negativo altera solo el campo que prueba.
const validLog = () => ({
  level: "error",
  event: "react_error_boundary",
  message: "Cannot read properties of undefined",
});

beforeAll(async () => {
  //Bajo carga, mongod no siempre arranca en los 10s por defecto.
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Log.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema Log", () => {
  it("guarda un log válido con source y context por defecto, y sin user", async () => {
    const log = new Log(validLog());

    const saved = await log.save();

    expect(saved.source).toBe("frontend");
    expect(saved.context).toEqual({});
    expect(saved.user).toBeUndefined();
  });

  it("guarda el context libre y el user cuando se proporcionan", async () => {
    const userId = new mongoose.Types.ObjectId();
    const log = new Log({
      ...validLog(),
      context: { boundary: "checkout", url: "/checkout" },
      user: userId,
    });

    const saved = await log.save();

    expect(saved.context.boundary).toBe("checkout");
    expect(saved.context.url).toBe("/checkout");
    expect(saved.user.toString()).toBe(userId.toString());
  });

  it("rechaza un log sin level", async () => {
    const log = new Log({ ...validLog(), level: undefined });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.level.kind).toBe("required");
  });

  it("rechaza un level fuera del enum", async () => {
    const log = new Log({ ...validLog(), level: "critical" });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.level.kind).toBe("enum");
  });

  it("rechaza un log sin event", async () => {
    const log = new Log({ ...validLog(), event: undefined });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.event.kind).toBe("required");
  });

  it("rechaza un event que queda vacío tras el trim", async () => {
    const log = new Log({ ...validLog(), event: "   " });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.event.kind).toBe("required");
  });

  it("rechaza un log sin message", async () => {
    const log = new Log({ ...validLog(), message: undefined });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.message.kind).toBe("required");
  });

  it("rechaza un message que queda vacío tras el trim", async () => {
    const log = new Log({ ...validLog(), message: "   " });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.message.kind).toBe("required");
  });

  it("rechaza un source fuera del enum", async () => {
    const log = new Log({ ...validLog(), source: "mobile" });

    const error = await captureError(log.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.source.kind).toBe("enum");
  });
});
