import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Product from "../../src/models/Product.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Producto mínimo válido; cada caso negativo altera solo el campo que prueba.
const validProduct = {
  name: "Tintura de Reishi",
  description: "Extracto doble de Reishi",
  unitPrice: 45000,
  fungus: "Reishi: G. lucidum",
  volume: "30ml",
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema Product", () => {
  it("guarda un producto válido con stock e imageURL por defecto", async () => {
    const product = new Product(validProduct);

    const saved = await product.save();

    expect(saved.stock).toBe(0);
    expect(saved.imageURL).toBe("https://placehold.co/600x400");
    expect(saved.unitPrice).toBe(45000);
  });

  it("rechaza un producto sin name", async () => {
    const product = new Product({ ...validProduct, name: undefined });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.name.kind).toBe("required");
  });

  it("rechaza un producto sin description", async () => {
    const product = new Product({ ...validProduct, description: undefined });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.description.kind).toBe("required");
  });

  it("rechaza un producto sin unitPrice", async () => {
    const product = new Product({ ...validProduct, unitPrice: undefined });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.unitPrice.kind).toBe("required");
  });

  it("rechaza un unitPrice negativo", async () => {
    const product = new Product({ ...validProduct, unitPrice: -1 });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.unitPrice.kind).toBe("min");
  });

  it("rechaza un stock negativo", async () => {
    const product = new Product({ ...validProduct, stock: -1 });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.stock.kind).toBe("min");
  });

  it("rechaza un producto sin fungus", async () => {
    const product = new Product({ ...validProduct, fungus: undefined });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.fungus.kind).toBe("required");
  });

  it("rechaza un fungus fuera del enum", async () => {
    const product = new Product({ ...validProduct, fungus: "Shiitake" });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.fungus.kind).toBe("enum");
  });

  it("rechaza un producto sin volume", async () => {
    const product = new Product({ ...validProduct, volume: undefined });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.volume.kind).toBe("required");
  });

  it("rechaza un volume fuera del enum", async () => {
    const product = new Product({ ...validProduct, volume: "200ml" });

    const error = await captureError(product.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.volume.kind).toBe("enum");
  });
});
