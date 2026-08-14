import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Order from "../../src/models/Order.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Las referencias no se populan en estos casos: basta con ObjectIds válidos.
const objectId = () => new mongoose.Types.ObjectId();

//Orden mínima válida; cada caso negativo altera solo el campo que prueba.
const validOrder = () => ({
  user: objectId(),
  products: [{ product: objectId(), quantity: 2, unitPrice: 45000 }],
  address: objectId(),
  paymentMethod: objectId(),
  totalPrice: 90000,
  statusOrder: "pending",
});

beforeAll(async () => {
  //Bajo carga, mongod no siempre arranca en los 10s por defecto.
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Order.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema Order", () => {
  it("guarda una orden válida con shippingCost por defecto y sus ítems", async () => {
    const data = validOrder();
    const order = new Order(data);

    const saved = await order.save();

    expect(saved.shippingCost).toBe(0);
    expect(saved.products).toHaveLength(1);
    expect(saved.products[0].product.toString()).toBe(
      data.products[0].product.toString(),
    );
    expect(saved.products[0].quantity).toBe(2);
    expect(saved.products[0].unitPrice).toBe(45000);
  });

  it("rechaza una orden sin user", async () => {
    const order = new Order({ ...validOrder(), user: undefined });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user.kind).toBe("required");
  });

  it("rechaza un ítem sin product", async () => {
    const order = new Order({
      ...validOrder(),
      products: [{ quantity: 2, unitPrice: 45000 }],
    });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.product"].kind).toBe("required");
  });

  it("rechaza un ítem sin quantity", async () => {
    const order = new Order({
      ...validOrder(),
      products: [{ product: objectId(), unitPrice: 45000 }],
    });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.quantity"].kind).toBe("required");
  });

  it("rechaza un ítem con quantity 0", async () => {
    const order = new Order({
      ...validOrder(),
      products: [{ product: objectId(), quantity: 0, unitPrice: 45000 }],
    });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.quantity"].kind).toBe("min");
  });

  it("rechaza un ítem sin unitPrice", async () => {
    const order = new Order({
      ...validOrder(),
      products: [{ product: objectId(), quantity: 2 }],
    });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors["products.0.unitPrice"].kind).toBe("required");
  });

  it("rechaza una orden sin address", async () => {
    const order = new Order({ ...validOrder(), address: undefined });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.address.kind).toBe("required");
  });

  it("rechaza una orden sin paymentMethod", async () => {
    const order = new Order({ ...validOrder(), paymentMethod: undefined });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.paymentMethod.kind).toBe("required");
  });

  it("rechaza una orden sin totalPrice", async () => {
    const order = new Order({ ...validOrder(), totalPrice: undefined });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.totalPrice.kind).toBe("required");
  });

  it("rechaza un statusOrder fuera del enum", async () => {
    const order = new Order({ ...validOrder(), statusOrder: "paid" });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.statusOrder.kind).toBe("enum");
  });

  it("rechaza una orden sin statusOrder, porque no tiene default", async () => {
    const order = new Order({ ...validOrder(), statusOrder: undefined });

    const error = await captureError(order.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.statusOrder.kind).toBe("required");
  });
});
