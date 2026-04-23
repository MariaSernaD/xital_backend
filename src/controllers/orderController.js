import Order from "../models/Order.js";

//Controlador para traer todas las ordenes de un usuario
const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ user: userId })
      .populate("user")
      .populate("products.product")
      .populate("address")
      .populate("paymentMethod");
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const order = await Order.findOne({ _id: id, user: userId })
      .populate("user")
      .populate("products.product")
      .populate("address")
      .populate("paymentMethod");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { products, address, paymentMethod, totalPrice, shippingCost } =
      req.body;
    const newOrder = await Order.create({
      user: userId,
      products,
      address,
      paymentMethod,
      totalPrice,
      shippingCost,
      statusOrder: "pending",
    });
    await newOrder.populate(["user", "products.product", "address", "paymentMethod"]);
    res.status(201).json(newOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { products, address, paymentMethod } = req.body;
    //verificar que la orden exista y que el usuario sea el dueño de la orden, si no existe o el usuario no es el dueño, retornar un error
    const orderIsExist = await Order.findOne({ _id: id, user: userId });
    if (!orderIsExist) {
      return res.status(404).json({ message: "Order not found" });
    }
    //solo se pueden actualizar las ordenes que esten en estado pendiente, si la orden no esta en estado pendiente, retornar un error
    const filterOrderByStatus = {
      _id: id,
      user: userId,
      statusOrder: "pending",
    };

    const updateOrder = await Order.findOneAndUpdate(
      filterOrderByStatus,
      {
        products,
        address,
        paymentMethod,
      },
      { new: true, runValidators: true },
    )
      .populate(["user", "products.product", "address", "paymentMethod"]);

    if (!updateOrder) {
      return res.status(400).json({
        message: "Order cannot be updated because it is not pending",
      });
    }
    res.status(200).json(updateOrder);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getOrders, getOrderById, createOrder, updateOrder};
