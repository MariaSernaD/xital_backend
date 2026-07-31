import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

//función para determinar el stock del producto
const checkStock = (product, quantity) => {
  return product.stock >= quantity;
};

const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("user")
      .populate("products.product");
    if (!carts.length) {
      return res.status(404).json({ message: "Carts not found" });
    }
    res.status(200).json(carts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId })
      .populate("user")
      .populate({
        path: "products.product",
        populate: { path: "category" },
      });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addProductToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product: productId, quantity = 1 } = req.body;
    // Validar que el producto exista
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    //validar que haya stock del producto
    if (!checkStock(product, quantity)) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    //validar que si NO hay un carrito, se cree uno al agregar producto y si ya hay un carrito, se agregue el producto al carrito existente
    let isCartExists = await Cart.findOne({ user: userId });
    if (!isCartExists) {
      isCartExists = await Cart.create({
        user: userId,
        products: [
          { product: productId, quantity, unitPrice: product.unitPrice },
        ],
      });
    } else {
      const isProductExists = isCartExists.products.find(
        (item) => item.product.toString() === productId,
      );
      if (isProductExists) {
        // Si el producto ya existe en el carrito, actualizar la cantidad y validar el stock nuevamente
        const totalQuantity = isProductExists.quantity + quantity;
        if (!checkStock(product, totalQuantity)) {
          return res.status(400).json({ message: "Insufficient stock" });
        }
        isProductExists.quantity = totalQuantity;
      } else {
        isCartExists.products.push({
          product: productId,
          quantity,
          unitPrice: product.unitPrice,
        });
      }
      await isCartExists.save();
    }
    await isCartExists.populate("user");
    await isCartExists.populate({
      path: "products.product",
      populate: { path: "category" },
    });
    res.status(200).json(isCartExists);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateProductFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { product: productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    } else {
      const productInCart = cart.products.find(
        (item) => item.product.toString() === productId,
      );
      if (!productInCart) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
      if (!checkStock(product, quantity)) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      productInCart.quantity = quantity;
    }
    await cart.save();
    await cart.populate("user");
    await cart.populate({
      path: "products.product",
      populate: { path: "category" },
    });
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteProductFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const productInCart = cart.products.find(
      (item) => item.product.toString() === productId,
    );
    if (!productInCart) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    // Eliminar el producto del carrito utilizando pull para eliminar el subdocumento completo
    cart.products.pull({ _id: productInCart._id });
    await cart.save();
    await cart.populate("user");
    await cart.populate({
      path: "products.product",
      populate: { path: "category" },
    });
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    // Vaciar el carrito estableciendo el array de productos a vacío, lo que eliminará todos los subdocumentos de productos en el carrito
    cart.products = [];
    await cart.save();
    res.status(200).json({ message: "Tu carrito está vacío" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getCarts,
  getUserCart,
  addProductToCart,
  updateProductFromCart,
  deleteProductFromCart,
  clearCart,
};
