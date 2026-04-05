import express from "express";
import Product from "./models/Product.js";

//conseguir todos los productos disponibles,en caso que no haya se enviará un mensaje de actualización al usuario
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
        const {id} = req.params;
        const product = await Product.findById(id).populate("category");
    } catch (error) {
        console.log(error);
        res.status(500).send({message: "Internal Server Error"});
    }
};

const createProduct = async (req, res) => {};

const updateProduct = async (req, res) => {};

const deleteProduct = async (req, res) => {};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
