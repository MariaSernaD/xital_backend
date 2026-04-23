import Wishlist from "../models/Wishlist.js";

const getWishlists = async (req, res) => {
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
    const userId = req.params.userId;
    const wishlistByUserId = await Wishlist.findOne({ user: userId })
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
    const  userId  = req.user.userId;
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
    const userId = req.user.userId;
    const {product} = req.body;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    const alreadyAdded = wishlist.products.some(
      (p) => p.product.toString() === product,
    );
    if (alreadyAdded) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }
    //dentro de la wishlist, se agrega un nuevo producto al array de productos, con el id del producto
    wishlist.products.push({ product});
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
    //este id es el de la wishlist que va en el endpoint
    const { id } = req.params;
    const { productId } = req.body;
    const wishlist = await Wishlist.findOne({_id: id, user: req.user.userId});
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    //el filtro devuelve un nuevo array SIN el producto que queremos eliminar
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
    const wishlist = await Wishlist.findOneAndDelete({_id: id, user: req.user.userId});
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
  getWishlists,
  getUserWishlist,
  createWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
  deleteWishlist,
};
