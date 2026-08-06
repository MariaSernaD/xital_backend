import paymentMethod from "../models/paymentMethod.js";

const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentMethods = await paymentMethod.find({user: userId});
    res.status(200).json(paymentMethods);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const paymentMethodId = await paymentMethod.findOne({_id: id, user: userId});
    if (!paymentMethodId) {
      return res.status(404).json({ message: "PaymentMethod not found" });
    }
    res.status(200).json(paymentMethodId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      type,
      cardNumber,
      cardHolderName,
      expiryDate,
      paypalEmail,
      bankName,
      isDefault,
    } = req.body;
    if (isDefault) {
      await paymentMethod.updateMany({ user: userId }, { isDefault: false });
    }
    const newPaymentMethod = await paymentMethod.create({
      user: userId,
      type,
      cardNumber,
      cardHolderName,
      expiryDate,
      paypalEmail,
      bankName,
      isDefault: isDefault || false,
    });
    await newPaymentMethod.populate("user");
    res
      .status(201)
      .json({
        message: "New paymentMethod was included",
        data: newPaymentMethod,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      type,
      cardNumber,
      cardHolderName,
      expiryDate,
      paypalEmail,
      bankName,
      isDefault,
    } = req.body;

    const isExistPaymentMethod = await paymentMethod.findOne({
      _id: id,
      user: userId,
    });
    if (!isExistPaymentMethod) {
      return res.status(404).json({ message: "PaymentMethod not found" });
    }
    if (isDefault && !isExistPaymentMethod.isDefault) {
      await paymentMethod.updateMany({ user: userId }, { isDefault: false });
    }
    isExistPaymentMethod.type = type || isExistPaymentMethod.type;
    isExistPaymentMethod.cardNumber =
      cardNumber || isExistPaymentMethod.cardNumber;
    isExistPaymentMethod.cardHolderName =
      cardHolderName || isExistPaymentMethod.cardHolderName;
    isExistPaymentMethod.expiryDate =
      expiryDate || isExistPaymentMethod.expiryDate;
    isExistPaymentMethod.paypalEmail =
      paypalEmail || isExistPaymentMethod.paypalEmail;
    isExistPaymentMethod.bankName = bankName || isExistPaymentMethod.bankName;
    isExistPaymentMethod.isDefault =
      isDefault !== undefined ? isDefault : isExistPaymentMethod.isDefault;
    const updatedPaymentMethod = await isExistPaymentMethod.save();
    res
      .status(200)
      .json({
        message: "PaymentMethod was updated",
        data: updatedPaymentMethod,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const paymentMethodToDelete = await paymentMethod.findOne({
      _id: id,
      user: userId,
    });
    if (!paymentMethodToDelete) {
      return res.status(404).json({ message: "Payment-method not found" });
    }
    if (paymentMethodToDelete.isDefault) {
      const anotherPaymentMethod = await paymentMethod.findOne({
        user: userId,
        _id: { $ne: id },
      });
      if (anotherPaymentMethod) {
        return res.status(400).json({
          message:
            "Please set another payment-method as default before deleting this one",
        });
      }
    }
    await paymentMethod.findOneAndDelete({
      _id: id,
      user: userId,
    });
    res.status(200).json({ message: "Payment-method deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};
