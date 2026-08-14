import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Cart from "../../src/models/Cart.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Las referencias no se populan en estos casos: basta con ObjectIds válidos.
const objectId = () => new mongoose.Types.ObjectId();

//Carrito mínimo válido; cada caso negativo altera solo el campo que prueba.
const validCart = () => ({
  user: objectId(),
  products: [{ product: objectId(), quantity: 1, unitPrice: 45000 }],
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Cart.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema Cart", () => {
  it("guarda un carrito válido con su ítem completo", async () => {
    const data = validCart();
    const cart = new Cart(data);

    const saved = await cart.save();

    expect(saved.user.toString()).toBe(data.user.toString());
    expect(saved.products).toHaveLength(1);
    expect(saved.products[0].product.toString()).toBe(
      data.products[0].product.toString(),
    );
    expect(saved.products[0].quantity).toBe(1);
    expect(saved.products[0].unitPrice).toBe(45000);
  });

  it("rechaza un carrito sin user", async () => {
    const cart = new Cart({ ...validCart(), user: undefined });

    const error = await captureError(cart.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user.kind).toBe("required");
  });

  it("rechaza un ítem sin product", async () => {
    const cart = new Cart({
      ...validCart(),
      products: [{ quantity: 1, unitPrice: 45000 }],
    });

    const error = await captureError(cart.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.product"].kind).toBe("required");
  });

  it("rechaza un ítem sin quantity", async () => {
    const cart = new Cart({
      ...validCart(),
      products: [{ product: objectId(), unitPrice: 45000 }],
    });

    const error = await captureError(cart.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.quantity"].kind).toBe("required");
  });

  it("rechaza un ítem con quantity 0", async () => {
    const cart = new Cart({
      ...validCart(),
      products: [{ product: objectId(), quantity: 0, unitPrice: 45000 }],
    });

    const error = await captureError(cart.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.quantity"].kind).toBe("min");
  });

  it("rechaza un ítem sin unitPrice", async () => {
    const cart = new Cart({
      ...validCart(),
      products: [{ product: objectId(), quantity: 1 }],
    });

    const error = await captureError(cart.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.unitPrice"].kind).toBe("required");
  });
});
