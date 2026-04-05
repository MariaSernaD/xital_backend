import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    imageURL: {
      type: String,
      default: "https://placehold.co/600x400",
    },
    fungus: {
      type: String,
      required: true,
      enum: [
        "Cordyceps: C. sinensis",
        "Cola de pavo: T. versicolor",
        "Melena de León: H. erinaceus",
      ],
    },
    volume: {
      type: String,
      required: true,
      enum: ["30ml", "50ml", "100ml"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
