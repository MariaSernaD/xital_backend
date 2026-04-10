import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Lógica para generar el password encriptado
const generatePassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

//Creación de un nuevo usuario se guarda la contraseña encriptada en la base de datos
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await generatePassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    //Seguridad: convierte el documento de Mongoose a un objeto JavaScript y elimina el campo de contraseña antes de enviar respuesta al cliente
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const updatedData = { name, email, role };
      if (password) {
        updatedData.password = await generatePassword(password);
      }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updatedData,
      { new: true },
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const {id} = req.params;
    const deletedUser = await User.findByIdAndDelete(id).select("-password");
    if(!deletedUser){
      return res.status(404).json({message: "User not found"});
    }
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser };
