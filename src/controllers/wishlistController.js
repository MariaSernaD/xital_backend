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
    // Si ya existe una wishlist, no crear otra
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

const addProductToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    const alreadyAdded = wishlist.products.some(
      (p) => p.product.toString() === productId,
    );
    if (alreadyAdded) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }
    wishlist.products.push({ product: productId });
    await wishlist.save();
    await wishlist.populate("user");
    await wishlist.populate("products.product");

    res.status(200).json(wishlist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeProductFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    //el filtro devuelve un nuevo array sin el producto que queremos eliminar
    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId,
    );
    await wishlist.save();
    await wishlist.populate("user");
    await wishlist.populate("products.product");
    res.status(200).json(wishlist);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const deleteWishlist = async (req, res) => {
  try {
    const {id}= req.params;
    const wishlist = await Wishlist.findByIdAndDelete(id);
    if(!wishlist){
      return res.status(404).json({ message: "Wishlist not found" });
    }
    res.status(200).send("Wishlist is deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getWishLists,
  getUserWishlist,
  createWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  deleteWishlist,
};
