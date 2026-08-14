import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import User from "../../src/models/User.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

beforeAll(async () => {
  //Bajo carga, mongod no siempre arranca en los 10s por defecto.
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
  //unique no es un validador: crea un índice. Sin esto el duplicado no falla.
  await User.init();
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema User", () => {
  it("guarda un usuario válido con role customer y el email normalizado", async () => {
    const user = new User({
      name: "  Ana Pérez  ",
      email: "  ANA@Mail.com  ",
      password: "secreto123",
    });

    const saved = await user.save();

    expect(saved.name).toBe("Ana Pérez");
    expect(saved.email).toBe("ana@mail.com");
    expect(saved.role).toBe("customer");
  });

  it("rechaza un usuario sin name", async () => {
    const user = new User({ email: "ana@mail.com", password: "secreto123" });

    const error = await captureError(user.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.name.kind).toBe("required");
  });

  it("rechaza un name que queda vacío tras el trim", async () => {
    const user = new User({
      name: "   ",
      email: "ana@mail.com",
      password: "secreto123",
    });

    const error = await captureError(user.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.name.kind).toBe("required");
  });

  it("rechaza un usuario sin email", async () => {
    const user = new User({ name: "Ana Pérez", password: "secreto123" });

    const error = await captureError(user.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.email.kind).toBe("required");
  });

  it("rechaza un segundo usuario con el mismo email", async () => {
    await User.create({
      name: "Ana Pérez",
      email: "ana@mail.com",
      password: "secreto123",
    });

    const error = await captureError(
      User.create({
        name: "Ana Duplicada",
        email: "ana@mail.com",
        password: "otroSecreto",
      }),
    );

    expect(error).not.toBeNull();
    expect(error.code).toBe(11000);
    expect(error.keyPattern).toHaveProperty("email");
    expect(await User.countDocuments({ email: "ana@mail.com" })).toBe(1);
  });

  it("rechaza un usuario sin password", async () => {
    const user = new User({ name: "Ana Pérez", email: "ana@mail.com" });

    const error = await captureError(user.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.password.kind).toBe("required");
  });

  it("rechaza un role fuera del enum", async () => {
    const user = new User({
      name: "Ana Pérez",
      email: "ana@mail.com",
      password: "secreto123",
      role: "superadmin",
    });

    const error = await captureError(user.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.role.kind).toBe("enum");
  });
});
