import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import PaymentMethod from "../../src/models/paymentMethod.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Método de pago mínimo válido; cada caso negativo altera solo el campo que prueba.
const validPaymentMethod = () => ({
  user: new mongoose.Types.ObjectId(),
  type: "credit_card",
  cardNumber: "4111111111111111",
  cardHolderName: "Ana Pérez",
  expiryDate: "12/28",
});

beforeAll(async () => {
  //Bajo carga, mongod no siempre arranca en los 10s por defecto.
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await PaymentMethod.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema PaymentMethod", () => {
  it("guarda un método de pago válido con isDefault e isActive por defecto", async () => {
    const paymentMethod = new PaymentMethod(validPaymentMethod());

    const saved = await paymentMethod.save();

    expect(saved.isDefault).toBe(false);
    expect(saved.isActive).toBe(true);
  });

  it("rechaza un método de pago sin user", async () => {
    const paymentMethod = new PaymentMethod({
      ...validPaymentMethod(),
      user: undefined,
    });

    const error = await captureError(paymentMethod.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user.kind).toBe("required");
  });

  it("rechaza un método de pago sin type", async () => {
    const paymentMethod = new PaymentMethod({
      ...validPaymentMethod(),
      type: undefined,
    });

    const error = await captureError(paymentMethod.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.type.kind).toBe("required");
  });

  it("rechaza un type fuera del enum", async () => {
    const paymentMethod = new PaymentMethod({
      ...validPaymentMethod(),
      type: "crypto",
    });

    const error = await captureError(paymentMethod.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.type.kind).toBe("enum");
  });
});
