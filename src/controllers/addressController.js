import Address from "../models/Address.js";

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;
    //el .sort sirve ordena los resultados de la consulta, en este caso ordena por el campo isDefault de forma descendente (-1), lo que significa que las direcciones marcadas como predeterminadas aparecerán primero en la lista.
    const addresses = await Address.find({ user: userId }).sort({
      isDefault: -1,
    });
    res.status(200).json(addresses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.userId;
    const address = await Address.findOne({ _id: addressId, user: userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
      addressType,
    } = req.body;

    // Si la nueva dirección se marca como predeterminada, actualiza todas las demás direcciones del usuario para que no sean predeterminadas
    if (isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }
    const newAddress = await Address.create({
      user: userId,
      name,
      address,
      city,
      state,
      postalCode,
      country: country || "México",
      phone,
      isDefault: isDefault || false,
      addressType: addressType || "home",
    });
    res.status(201).json(newAddress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.userId;
    const {
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
      addressType,
    } = req.body;

    const existingAddress = await Address.findOne({
      _id: addressId,
      user: userId,
    });

    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    //Si el usuario está activando esta dirección como predeterminada, desactivamos todas las demás primero
    if (isDefault && !existingAddress.isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }
//es necesario poner una validación con el || OR por si no viene el campo en el body, se la asigna undefined y se podria borrar la  info existente.
    existingAddress.name = name || existingAddress.name;
    existingAddress.address = address || existingAddress.address;
    existingAddress.city = city || existingAddress.city;
    existingAddress.state = state || existingAddress.state;
    existingAddress.postalCode = postalCode || existingAddress.postalCode;
    existingAddress.country = country || existingAddress.country;
    existingAddress.phone = phone || existingAddress.phone;
    existingAddress.isDefault =
      isDefault !== undefined ? isDefault : existingAddress.isDefault;
    existingAddress.addressType = addressType || existingAddress.addressType;

    const updatedAddress = await existingAddress.save();

    res.status(200).json(updatedAddress);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.userId;

    const addressToDelete = await Address.findOne({
      _id: addressId,
      user: userId,
    });
    if (!addressToDelete) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (addressToDelete.isDefault) {
      const anotherAddress = await Address.findOne({
        user: userId,
        _id: { $ne: addressId },
      });
      if (anotherAddress) {
        return res.status(400).json({
          message:
            "Please set another address as default before deleting this one",
        });
      }
    }
    await Address.findOneAndDelete({ _id: addressId, user: userId });
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  getUserAddresses,
  getUserAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
