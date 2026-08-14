import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Address from "../../src/models/Address.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Dirección mínima válida; cada caso negativo altera solo el campo que prueba.
const validAddress = () => ({
  user: new mongoose.Types.ObjectId(),
  name: "Casa",
  address: "Calle 123 #45-67",
  city: "Medellín",
  state: "Antioquia",
  postalCode: "050001",
  country: "Colombia",
  phone: "3001234567",
});

beforeAll(async () => {
  //Bajo carga, mongod no siempre arranca en los 10s por defecto.
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Address.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema Address", () => {
  it("guarda una dirección válida con isDefault y addressType por defecto", async () => {
    const address = new Address(validAddress());

    const saved = await address.save();

    expect(saved.isDefault).toBe(false);
    expect(saved.addressType).toBe("home");
  });

  it("rechaza una dirección sin user", async () => {
    const address = new Address({ ...validAddress(), user: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user.kind).toBe("required");
  });

  it("rechaza una dirección sin name", async () => {
    const address = new Address({ ...validAddress(), name: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.name.kind).toBe("required");
  });

  it("rechaza una dirección sin address", async () => {
    const address = new Address({ ...validAddress(), address: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.address.kind).toBe("required");
  });

  it("rechaza una dirección sin city", async () => {
    const address = new Address({ ...validAddress(), city: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.city.kind).toBe("required");
  });

  it("rechaza una dirección sin state", async () => {
    const address = new Address({ ...validAddress(), state: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.state.kind).toBe("required");
  });

  it("rechaza una dirección sin postalCode", async () => {
    const address = new Address({ ...validAddress(), postalCode: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.postalCode.kind).toBe("required");
  });

  it("rechaza un postalCode de menos de 4 caracteres", async () => {
    const address = new Address({ ...validAddress(), postalCode: "123" });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.postalCode.kind).toBe("minlength");
  });

  it("rechaza un postalCode de más de 6 caracteres", async () => {
    const address = new Address({ ...validAddress(), postalCode: "1234567" });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.postalCode.kind).toBe("maxlength");
  });

  it("rechaza una dirección sin country", async () => {
    const address = new Address({ ...validAddress(), country: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.country.kind).toBe("required");
  });

  it("rechaza una dirección sin phone", async () => {
    const address = new Address({ ...validAddress(), phone: undefined });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.phone.kind).toBe("required");
  });

  it("rechaza un phone de más de 15 caracteres", async () => {
    const address = new Address({ ...validAddress(), phone: "3001234567890123" });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.phone.kind).toBe("maxlength");
  });

  it("rechaza un addressType fuera del enum", async () => {
    const address = new Address({ ...validAddress(), addressType: "office" });

    const error = await captureError(address.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.addressType.kind).toBe("enum");
  });
});
