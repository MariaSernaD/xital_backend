import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import Review from "../../src/models/Review.js";

let mongoServer;

//Ejecuta la promesa y devuelve el error que lanzó, para poder inspeccionarlo.
const captureError = async (promise) =>
  promise.then(() => null, (error) => error);

//Review mínima válida; cada caso negativo altera solo el campo que prueba.
const validReview = () => ({
  comment: "Excelente producto, repito",
  rating: 4,
  user: new mongoose.Types.ObjectId(),
  product: new mongoose.Types.ObjectId(),
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Review.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Esquema Review", () => {
  it("guarda una review válida conservando user y product", async () => {
    const data = validReview();
    const review = new Review(data);

    const saved = await review.save();

    expect(saved.rating).toBe(4);
    expect(saved.user.toString()).toBe(data.user.toString());
    expect(saved.product.toString()).toBe(data.product.toString());
  });

  it("rechaza una review sin comment", async () => {
    const review = new Review({ ...validReview(), comment: undefined });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.comment.kind).toBe("required");
  });

  it("rechaza un comment que queda vacío tras el trim", async () => {
    const review = new Review({ ...validReview(), comment: "   " });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.comment.kind).toBe("required");
  });

  it("rechaza una review sin rating, con el mensaje custom del esquema", async () => {
    const review = new Review({ ...validReview(), rating: undefined });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.rating.kind).toBe("required");
    expect(error.errors.rating.message).toBe(
      "We pleased if you can validate your product",
    );
  });

  it("rechaza un rating menor que 1", async () => {
    const review = new Review({ ...validReview(), rating: 0 });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.rating.kind).toBe("min");
  });

  it("rechaza un rating mayor que 5", async () => {
    const review = new Review({ ...validReview(), rating: 6 });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.rating.kind).toBe("max");
  });

  it("rechaza una review sin user", async () => {
    const review = new Review({ ...validReview(), user: undefined });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user.kind).toBe("required");
  });

  it("rechaza una review sin product", async () => {
    const review = new Review({ ...validReview(), product: undefined });

    const error = await captureError(review.save());

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.product.kind).toBe("required");
  });
});
