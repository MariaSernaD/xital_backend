import Wishlist from "../models/Wishlist.js";

const getWishLists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate("user")
      .populate("products.product");
    res.status(200).json(wishlists);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getUserWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const wishlistByUserId = await Wishlist.findOne({ user: id })
      .populate("user")
      .populate("products.product");
    if (!wishlistByUserId) {
      return res.status(404).send("Wishlist not found");
    }
    res.status(200).json(wishlistByUserId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const createWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    // Si ya tiene wishlist, no crear otra
    const wishlistExists = await Wishlist.findOne({ user: userId });
    if (wishlistExists) {
      return res.status(409).json({ message: "User already has a wishlist" });
    }
    const newWishlist = await Wishlist.create({ user: userId, products: [] });
    await newWishlist.populate("user");
    res.status(201).json(newWishlist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const addProductToAWishlist = async (req, res) => {};
const removeProductFromWishlist = async (req, res) => {};
const deleteWishlist = async (req, res) => {};

export {
  getWishLists,
  getUserWishlist,
  createWishlist,
  addProductToAWishlist,
  removeProductFromWishlist,
  deleteWishlist,
};
