import express from "express";
import Product from "./models/Product.js";

//trae todos los productos disponibles,en caso que no haya se enviará un mensaje de actualización de catálogo al usuario
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    if (products.length === 0) {
      return res
        .status(404)
        .send({ message: "We are updating the products, wait for them" });
    } else {
      res.status(200).json(products);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//solo el admin tiene el derecho de crear un producto, por lo que se debe autenticar con su rol para hacerlo
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      unitPrice,
      stock,
      imageURL,
      fungus,
      volume,
      category,
    } = req.body;
    const newProduct = await Product.create({
      name,
      description,
      unitPrice,
      stock,
      imageURL,
      fungus,
      volume,
      category,
    });
    if (!newProduct) {
      return res.status(400).send({ message: "Failed to create product" });
    }
    await newProduct.populate("category");
    res.status(201).json(newProduct);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      unitPrice,
      stock,
      imageURL,
      fungus,
      volume,
      category,
    } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        unitPrice,
        stock,
        imageURL,
        fungus,
        volume,
        category,
      },
      //los runValidators se usan para asegurar que los datos modificados cumplan con las reglas de validación definidas en el esquema
      { new: true, runValidators: true },
    ).populate("category");
    if (!updatedProduct) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const deleteProduct = async (req, res) => {};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
